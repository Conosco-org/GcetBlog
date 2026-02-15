/**
 * Newsletter Job Handlers
 *
 * Cron tasks for automated newsletter operations:
 * - Daily/weekly/monthly digest generation
 * - Scheduled newsletter sending
 */

import type { PayloadHandler } from 'payload'
import { generateDigest } from '@/services/email/sender'
import { sendNewsletter } from '@/services/email/sender'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

/**
 * Daily Digest Job
 * Generates and sends daily digest of recent posts
 */
export const newsletterDailyDigest = (async () => {
  console.log('[Job] Running daily digest generation...')
  
  const result = await generateDigest('daily')
  
  if (result.created) {
    console.log(`[Job] Daily digest created with ${result.postCount} posts.`)
  } else {
    console.log('[Job] Daily digest skipped - no new posts.')
  }
  
  return result
}) as any

/**
 * Weekly Digest Job
 * Generates and sends weekly digest of recent posts
 */
export const newsletterWeeklyDigest = (async () => {
  console.log('[Job] Running weekly digest generation...')
  
  const result = await generateDigest('weekly')
  
  if (result.created) {
    console.log(`[Job] Weekly digest created with ${result.postCount} posts.`)
  } else {
    console.log('[Job] Weekly digest skipped - no new posts.')
  }
  
  return result
}) as any

/**
 * Monthly Digest Job
 * Generates and sends monthly digest of recent posts
 */
export const newsletterMonthlyDigest = (async () => {
  console.log('[Job] Running monthly digest generation...')
  
  const result = await generateDigest('monthly')
  
  if (result.created) {
    console.log(`[Job] Monthly digest created with ${result.postCount} posts.`)
  } else {
    console.log('[Job] Monthly digest skipped - no new posts.')
  }
  
  return result
}) as any

/**
 * Scheduled Newsletters Job
 * Checks for newsletters scheduled to be sent now and processes them
 */
export const newsletterScheduledSend = (async () => {
  console.log('[Job] Checking for scheduled newsletters...')
  
  const payload = await getPayload({ config: configPromise })
  
  // Find newsletters scheduled for the past (should have been sent by now)
  const now = new Date()
  const scheduledNewsletters = await payload.find({
    collection: 'newsletters',
    where: {
      and: [
        { status: { equals: 'scheduled' } },
        { scheduledFor: { less_than_equal: now.toISOString() } },
      ],
    },
    limit: 10,
    depth: 0,
  })
  
  if (scheduledNewsletters.docs.length === 0) {
    console.log('[Job] No scheduled newsletters to send.')
    return { success: true, sent: 0 }
  }
  
  let sent = 0
  let failed = 0
  
  for (const newsletter of scheduledNewsletters.docs) {
    try {
      console.log(`[Job] Sending scheduled newsletter: ${newsletter.title}`)
      
      const result = await sendNewsletter(newsletter.id as string)
      
      if (result.success) {
        sent++
        console.log(`[Job] Scheduled newsletter sent: ${newsletter.title}`)
      } else {
        failed++
        console.error(`[Job] Failed to send scheduled newsletter: ${newsletter.title}`, result.errors)
      }
    } catch (err) {
      failed++
      console.error(`[Job] Error sending scheduled newsletter: ${newsletter.title}`, err)
    }
  }
  
  console.log(`[Job] Scheduled send complete. Sent: ${sent}, Failed: ${failed}`)
  
  return {
    success: true,
    sent,
    failed,
  }
}) as any

/**
 * Stats Rollup Job (Optional)
 * Aggregates newsletter stats periodically for performance
 */
export const newsletterStatsRollup = (async () => {
  console.log('[Job] Running newsletter stats rollup...')
  
  const payload = await getPayload({ config: configPromise })
  
  // Find all sent newsletters
  const sentNewsletters = await payload.find({
    collection: 'newsletters',
    where: { status: { equals: 'sent' } },
    limit: 100,
    depth: 0,
  })
  
  let updated = 0
  
  for (const newsletter of sentNewsletters.docs) {
    try {
      // Count events for this newsletter
      const [sentCount, openedCount, clickedCount, bouncedCount, unsubscribedCount] = await Promise.all([
        payload.count({
          collection: 'newsletter-events',
          where: {
            and: [
              { newsletter: { equals: newsletter.id } },
              { type: { equals: 'sent' } },
            ],
          },
        }),
        payload.count({
          collection: 'newsletter-events',
          where: {
            and: [
              { newsletter: { equals: newsletter.id } },
              { type: { equals: 'opened' } },
            ],
          },
        }),
        payload.count({
          collection: 'newsletter-events',
          where: {
            and: [
              { newsletter: { equals: newsletter.id } },
              { type: { equals: 'clicked' } },
            ],
          },
        }),
        payload.count({
          collection: 'newsletter-events',
          where: {
            and: [
              { newsletter: { equals: newsletter.id } },
              { type: { equals: 'bounced' } },
            ],
          },
        }),
        payload.count({
          collection: 'newsletter-events',
          where: {
            and: [
              { newsletter: { equals: newsletter.id } },
              { type: { equals: 'unsubscribed' } },
            ],
          },
        }),
      ])
      
      // Update newsletter stats
      await payload.update({
        collection: 'newsletters',
        id: newsletter.id as string,
        data: {
          stats: {
            totalRecipients: sentCount.totalDocs,
            delivered: sentCount.totalDocs - bouncedCount.totalDocs,
            opened: openedCount.totalDocs,
            clicked: clickedCount.totalDocs,
            bounced: bouncedCount.totalDocs,
            unsubscribed: unsubscribedCount.totalDocs,
          },
        },
      })
      
      updated++
    } catch (err) {
      console.error(`[Job] Error updating stats for newsletter ${newsletter.id}:`, err)
    }
  }
  
  console.log(`[Job] Stats rollup complete. Updated ${updated} newsletters.`)
  
  return {
    success: true,
    updated,
  }
}) as any
