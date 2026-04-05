/**
 * Newsletter Subscribe API
 *
 * POST /api/newsletter/subscribe
 * Body: { email, name?, categories?, frequency? }
 *
 * Handles new subscriptions, reactivation of unsubscribed users,
 * and sends double opt-in confirmation emails.
 *
 * Privacy: never reveals if an email already exists.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { sendWelcomeEmail } from '@/services/email/sender'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, categories, frequency } = body as {
      email?: string
      name?: string
      categories?: string[]
      frequency?: string
    }

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: 'A valid email address is required.' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config: configPromise })

    // Check if subscriber already exists
    const existing = await payload.find({
      collection: 'newsletter-subscribers',
      where: { email: { equals: email.toLowerCase().trim() } },
      limit: 1,
      depth: 0,
    })

    if (existing.docs.length > 0) {
      const subscriber = existing.docs[0]

      if (subscriber.status === 'active' && subscriber.confirmedAt) {
        // Already subscribed and confirmed - return success silently (privacy)
        return NextResponse.json({
          success: true,
          message: 'Thanks for subscribing! Check your email for confirmation.',
        })
      }

      if (subscriber.status === 'unsubscribed' || subscriber.status === 'pending') {
        // Reactivate: set back to pending for re-confirmation
        await payload.update({
          collection: 'newsletter-subscribers',
          id: String(subscriber.id),
          data: {
            status: 'pending',
            unsubscribedAt: null,
            ...(name ? { name } : {}),
            ...(categories?.length ? { categories } : {}),
            ...(frequency ? { frequency } : {}),
          } as never,
        })

        // Re-send welcome/confirmation email
        await sendWelcomeEmail(
          email,
          name ?? subscriber.name,
          String(subscriber.unsubscribeToken || ''),
        ).catch((err) => console.error('[Subscribe] Failed to send welcome email:', err))

        return NextResponse.json({
          success: true,
          message: 'Thanks for subscribing! Check your email for confirmation.',
        })
      }

      // Bounced or complained - return generic success (privacy)
      return NextResponse.json({
        success: true,
        message: 'Thanks for subscribing! Check your email for confirmation.',
      })
    }

    // Create new subscriber
    const newSubscriber = await payload.create({
      collection: 'newsletter-subscribers',
      data: {
        email: email.toLowerCase().trim(),
        name: name ?? undefined,
        status: 'pending' as const,
        source: 'public_form' as const,
        categories: categories?.length ? categories : undefined,
        frequency: (frequency ?? 'weekly') as 'daily' | 'weekly' | 'monthly',
      } as never,
    })

    // Send double opt-in confirmation email
    await sendWelcomeEmail(
      email,
      name,
      String(newSubscriber.unsubscribeToken || ''),
    ).catch((err) => console.error('[Subscribe] Failed to send welcome email:', err))

    return NextResponse.json({
      success: true,
      message: 'Thanks for subscribing! Check your email for confirmation.',
    })
  } catch (err) {
    console.error('[Subscribe API] Error:', err)
    return NextResponse.json(
      { success: false, message: 'Something went wrong. Please try again later.' },
      { status: 500 },
    )
  }
}
