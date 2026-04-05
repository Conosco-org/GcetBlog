/**
 * Newsletter Sending Engine
 *
 * Core logic for:
 * 1. Sending a newsletter campaign to all matching subscribers
 * 2. Auto-generating digest newsletters from recent posts
 * 3. Sending individual emails (welcome, confirmation, etc.)
 *
 * Handles personalization, tracking injection, rate limiting,
 * and error recovery with retry logic.
 */

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { render } from '@react-email/render'
import React from 'react'

import { getEmailService } from '@/services/email'
import type { EmailMessage } from '@/services/email/types'
import {
  prepareEmailForSend,
  getComplianceHeaders,
  getSubscriberUrls,
} from '@/services/email/tracking'
import { NewsletterDigest } from '@/services/email/templates/NewsletterDigest'
import type { DigestPost } from '@/services/email/templates/NewsletterDigest'
import { NewsletterManual } from '@/services/email/templates/NewsletterManual'
import { WelcomeEmail } from '@/services/email/templates/WelcomeEmail'
import { UnsubscribeConfirmation } from '@/services/email/templates/UnsubscribeConfirmation'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Subscriber {
  id: string
  email: string
  name?: string | null
  unsubscribeToken: string
  categories?: { id: string }[] | string[]
}

interface SendNewsletterResult {
  success: boolean
  totalRecipients: number
  sent: number
  failed: number
  errors: string[]
}

// ---------------------------------------------------------------------------
// Rate limiter (simple token-bucket for respecting SMTP limits)
// ---------------------------------------------------------------------------

async function rateLimitedSend(
  messages: EmailMessage[],
  rateLimit: number,
): Promise<{ sent: number; failed: number; errors: string[] }> {
  const emailService = getEmailService()
  let sent = 0
  let failed = 0
  const errors: string[] = []

  // Process in batches respecting rate limit
  const batchSize = Math.max(1, rateLimit)
  const delayMs = 1000 // 1 second between batches

  for (let i = 0; i < messages.length; i += batchSize) {
    const batch = messages.slice(i, i + batchSize)

    const results = await Promise.allSettled(
      batch.map((msg) => emailService.send(msg)),
    )

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value.success) {
        sent++
      } else {
        failed++
        const errMsg =
          result.status === 'fulfilled'
            ? result.value.error ?? 'Unknown send error'
            : result.reason?.message ?? 'Promise rejected'
        errors.push(errMsg)
      }
    }

    // Delay between batches (except for last batch)
    if (i + batchSize < messages.length) {
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
  }

  return { sent, failed, errors }
}

// ---------------------------------------------------------------------------
// Send newsletter campaign
// ---------------------------------------------------------------------------

export async function sendNewsletter(
  newsletterId: string,
): Promise<SendNewsletterResult> {
  const payload = await getPayload({ config: configPromise })
  const emailService = getEmailService()

  // 1. Fetch newsletter with populated posts
  // @ts-expect-error - Payload RichText Lexical type is too strict for deeply populated relations
  const newsletter: Record<string, unknown> = await payload.findByID({
    collection: 'newsletters',
    id: newsletterId,
    depth: 2,
  })

  if (!newsletter) {
    return { success: false, totalRecipients: 0, sent: 0, failed: 0, errors: ['Newsletter not found'] }
  }

  if (newsletter.status === 'sent') {
    return { success: false, totalRecipients: 0, sent: 0, failed: 0, errors: ['Newsletter already sent'] }
  }

  // 2. Mark as sending
  await payload.update({
    collection: 'newsletters',
    id: newsletterId,
    data: { status: 'sending' },
  })

  try {
    // 3. Query active, confirmed subscribers matching target categories
    const subscriberWhere: Record<string, unknown> = {
      and: [
        { status: { equals: 'active' } },
        { confirmedAt: { exists: true } },
      ],
    }

    // Filter by target categories if specified
    const targetCats = newsletter.targetCategories
    if (targetCats && Array.isArray(targetCats) && targetCats.length > 0) {
      const catIds = targetCats.map((c: unknown) =>
        typeof c === 'object' && c !== null && 'id' in c
          ? (c as { id: string }).id
          : String(c),
      )
      ;(subscriberWhere.and as unknown[]).push({
        categories: { in: catIds },
      })
    }

    // Fetch all matching subscribers (paginated internally)
    const allSubscribers: Subscriber[] = []
    let page = 1
    let hasMore = true

    while (hasMore) {
      const result = await payload.find({
        collection: 'newsletter-subscribers',
        // @ts-expect-error - Payload where clause type is too strict for dynamic queries
        where: subscriberWhere,
        limit: 100,
        page,
        depth: 0,
      })
      allSubscribers.push(
        ...result.docs.map((doc) => ({
          id: doc.id as string,
          email: doc.email,
          name: doc.name,
          unsubscribeToken: doc.unsubscribeToken as string,
          categories: doc.categories as Subscriber['categories'],
        })),
      )
      hasMore = result.hasNextPage
      page++
    }

    if (allSubscribers.length === 0) {
      await payload.update({
        collection: 'newsletters',
        id: newsletterId,
        data: { status: 'sent', sentAt: new Date().toISOString(), stats: { totalRecipients: 0 } },
      })
      return { success: true, totalRecipients: 0, sent: 0, failed: 0, errors: [] }
    }

    // 4. Render the base template HTML
    let baseHtml: string

    if (newsletter.type === 'auto_digest' && newsletter.posts) {
      const posts: DigestPost[] = (
        Array.isArray(newsletter.posts) ? newsletter.posts : []
      ).map((post: Record<string, unknown>) => ({
        title: String(post.title ?? ''),
        excerpt: String(post.meta && typeof post.meta === 'object' && 'description' in post.meta
          ? (post.meta as { description?: string }).description ?? ''
          : ''),
        slug: String(post.slug ?? ''),
        heroImageUrl: undefined, // Will be resolved from media if needed
        authorName:
          Array.isArray(post.populatedAuthors) && post.populatedAuthors.length > 0
            ? String((post.populatedAuthors[0] as { name?: string }).name ?? 'GCET Blog')
            : 'GCET Blog',
        categoryName: undefined,
        publishedAt: post.publishedAt
          ? new Date(String(post.publishedAt)).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })
          : '',
      }))

      baseHtml = await render(
        React.createElement(NewsletterDigest, {
          frequency: (newsletter.frequency as 'daily' | 'weekly' | 'monthly') ?? 'weekly',
          posts,
          unsubscribeUrl: '__UNSUB_URL__',
          preferencesUrl: '__PREF_URL__',
        }),
      )
    } else {
      // Manual compose - render Lexical content to HTML
      // For now, use a simple approach; Lexical content will need serialization
      const contentHtml =
        typeof newsletter.content === 'string'
          ? newsletter.content
          : '<p>Check out the latest updates on GCET Blog!</p>'

      baseHtml = await render(
        React.createElement(NewsletterManual, {
          subject: String(newsletter.subject ?? ''),
          contentHtml,
          unsubscribeUrl: '__UNSUB_URL__',
          preferencesUrl: '__PREF_URL__',
        }),
      )
    }

    // 5. Build personalized messages for each subscriber
    const messages: EmailMessage[] = allSubscribers.map((sub) => {
      const urls = getSubscriberUrls(sub.unsubscribeToken)

      // Replace placeholder URLs with subscriber-specific ones
      let personalizedHtml = baseHtml
        .replace(/__UNSUB_URL__/g, urls.unsubscribeUrl)
        .replace(/__PREF_URL__/g, urls.preferencesUrl)

      // Personalize greeting if subscriber has a name
      if (sub.name) {
        personalizedHtml = personalizedHtml
          .replace(/Hi there/g, `Hi ${sub.name}`)
      }

      // Inject tracking (links + pixel)
      personalizedHtml = prepareEmailForSend(personalizedHtml, newsletterId, sub.id)

      const complianceHeaders = getComplianceHeaders(urls.unsubscribeUrl)

      return {
        to: { email: sub.email, name: sub.name ?? undefined },
        subject: String(newsletter.subject ?? ''),
        html: personalizedHtml,
        headers: complianceHeaders,
        listUnsubscribe: complianceHeaders['List-Unsubscribe'],
        listUnsubscribePost: complianceHeaders['List-Unsubscribe-Post'],
        tags: [
          { name: 'campaign', value: newsletterId },
          { name: 'type', value: String(newsletter.type ?? 'manual') },
        ],
        metadata: {
          newsletterId,
          subscriberId: sub.id,
        },
      }
    })

    // 6. Send with rate limiting
    const rateLimit = emailService.settings.rateLimit ?? 10
    const { sent, failed, errors } = await rateLimitedSend(messages, rateLimit)

    // 7. Create "sent" events for tracking
    const sentEventPromises = allSubscribers.map((sub) =>
      payload
        .create({
          collection: 'newsletter-events',
          data: {
            newsletter: newsletterId,
            subscriber: sub.id,
            type: 'sent',
            timestamp: new Date().toISOString(),
          },
        })
        .catch(() => null), // Don't fail the whole operation for event logging
    )
    await Promise.allSettled(sentEventPromises)

    // 8. Update newsletter status and stats
    const finalStatus = failed === allSubscribers.length ? 'failed' : 'sent'
    await payload.update({
      collection: 'newsletters',
      id: newsletterId,
      data: {
        status: finalStatus,
        sentAt: new Date().toISOString(),
        stats: {
          totalRecipients: allSubscribers.length,
          delivered: sent,
          bounced: failed,
          opened: 0,
          clicked: 0,
          unsubscribed: 0,
        },
      },
    })

    return {
      success: finalStatus === 'sent',
      totalRecipients: allSubscribers.length,
      sent,
      failed,
      errors,
    }
  } catch (err) {
    // Mark as failed
    await payload.update({
      collection: 'newsletters',
      id: newsletterId,
      data: { status: 'failed' },
    }).catch(() => null)

    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    return { success: false, totalRecipients: 0, sent: 0, failed: 0, errors: [errorMsg] }
  }
}

// ---------------------------------------------------------------------------
// Auto-digest generation
// ---------------------------------------------------------------------------

export async function generateDigest(
  frequency: 'daily' | 'weekly' | 'monthly',
): Promise<{ created: boolean; newsletterId?: string; postCount: number }> {
  const payload = await getPayload({ config: configPromise })

  // Calculate date range
  const now = new Date()
  const rangeStart = new Date(now)

  switch (frequency) {
    case 'daily':
      rangeStart.setDate(rangeStart.getDate() - 1)
      break
    case 'weekly':
      rangeStart.setDate(rangeStart.getDate() - 7)
      break
    case 'monthly':
      rangeStart.setMonth(rangeStart.getMonth() - 1)
      break
  }

  // Query recently published posts
  const recentPosts = await payload.find({
    collection: 'posts',
    where: {
      and: [
        { _status: { equals: 'published' } },
        { publishedAt: { greater_than: rangeStart.toISOString() } },
      ],
    },
    sort: '-publishedAt',
    limit: 20,
    depth: 1,
  })

  if (recentPosts.docs.length === 0) {
    return { created: false, postCount: 0 }
  }

  // Check if there are active subscribers for this frequency
  const subscriberCount = await payload.count({
    collection: 'newsletter-subscribers',
    where: {
      and: [
        { status: { equals: 'active' } },
        { confirmedAt: { exists: true } },
        { frequency: { equals: frequency } },
      ],
    },
  })

  if (subscriberCount.totalDocs === 0) {
    return { created: false, postCount: recentPosts.docs.length }
  }

  // Create the digest newsletter
  const frequencyLabel = frequency.charAt(0).toUpperCase() + frequency.slice(1)
  const dateStr = now.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  const newsletter = await payload.create({
    collection: 'newsletters',
    data: {
      title: `${frequencyLabel} Digest - ${dateStr}`,
      subject: `📰 Your ${frequencyLabel} GCET Blog Digest - ${recentPosts.docs.length} new post${recentPosts.docs.length !== 1 ? 's' : ''}`,
      type: 'auto_digest',
      frequency,
      status: 'draft',
      posts: recentPosts.docs.map((p) => p.id),
      templateId: 'digest',
    },
  })

  return {
    created: true,
    newsletterId: newsletter.id as string,
    postCount: recentPosts.docs.length,
  }
}

// ---------------------------------------------------------------------------
// Utility: Send welcome email to a new subscriber
// ---------------------------------------------------------------------------

export async function sendWelcomeEmail(
  email: string,
  name: string | undefined | null,
  unsubscribeToken: string,
): Promise<void> {
  const emailService = getEmailService()
  const urls = getSubscriberUrls(unsubscribeToken)

  const html = await render(
    React.createElement(WelcomeEmail, {
      subscriberName: name ?? undefined,
      confirmUrl: urls.confirmUrl,
      preferencesUrl: urls.preferencesUrl,
    }),
  )

  await emailService.send({
    to: { email, name: name ?? undefined },
    subject: 'Confirm your subscription to GCET Blog ✉️',
    html,
    headers: {
      'X-Mailer': 'GCET-Blog-Newsletter',
    },
  })
}

// ---------------------------------------------------------------------------
// Utility: Send unsubscribe confirmation
// ---------------------------------------------------------------------------

export async function sendUnsubscribeConfirmation(
  email: string,
  name: string | undefined | null,
  unsubscribeToken: string,
): Promise<void> {
  const emailService = getEmailService()
  const urls = getSubscriberUrls(unsubscribeToken)

  const html = await render(
    React.createElement(UnsubscribeConfirmation, {
      subscriberName: name ?? undefined,
      resubscribeUrl: urls.resubscribeUrl,
    }),
  )

  await emailService.send({
    to: { email, name: name ?? undefined },
    subject: "You've been unsubscribed from GCET Blog",
    html,
    headers: {
      'X-Mailer': 'GCET-Blog-Newsletter',
    },
  })
}
