/**
 * Newsletter Job Handlers
 *
 * Cron tasks for automated newsletter operations:
 * - Daily/weekly/monthly digest generation
 * - Scheduled newsletter sending
 */

import { generateDigest } from '@/services/email/sender'
import { sendNewsletter } from '@/services/email/sender'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

/**
 * Daily Digest Job
 * Generates and sends daily digest of recent posts
 */
export const newsletterDailyDigest = async () => {
  const result = await generateDigest('daily')
  return result
}

/**
 * Weekly Digest Job
 * Generates and sends weekly digest of recent posts
 */
export const newsletterWeeklyDigest = async () => {
  const result = await generateDigest('weekly')
  return result
}

/**
 * Monthly Digest Job
 * Generates and sends monthly digest of recent posts
 */
export const newsletterMonthlyDigest = async () => {
  const result = await generateDigest('monthly')
  return result
}

/**
 * Scheduled Newsletters Job
 * Checks for newsletters scheduled to be sent now and processes them
 */
export const newsletterScheduledSend = async () => {
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
    return { success: true, sent: 0 }
  }
  
  let sent = 0
  let failed = 0
  
  for (const newsletter of scheduledNewsletters.docs) {
    try {
      const result = await sendNewsletter(newsletter.id as string)
      
      if (result.success) {
        sent++
      } else {
        failed++
      }
    } catch {
      failed++
    }
  }
  
  return {
    success: true,
    sent,
    failed,
  }
}

/**
 * Stats Rollup Job (Optional)
 * Aggregates newsletter stats periodically for performance
 */
export const newsletterStatsRollup = async () => {
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
    } catch {
      // Silently continue on error
    }
  }
  
  return {
    success: true,
    updated,
  }
}
