import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Spam analytics aggregation utility
 * Validates: Requirement 13.3
 */

export interface SpamAnalytics {
  totalSpam: number
  byType: Record<string, number>
  byDate: Record<string, number>
  recentSpam: Array<{
    id: string
    content: string
    spamType: string
    postTitle: string
    timestamp: string
  }>
}

/**
 * Aggregate spam comments by type and date
 */
export async function aggregateSpamAnalytics(
  startDate?: Date,
  endDate?: Date,
): Promise<SpamAnalytics> {
  const payload = await getPayload({ config })

  // Build date filter
  const where: { status: { equals: string }; createdAt?: { greater_than_equal?: string; less_than_equal?: string } } = { status: { equals: 'spam' } }

  if (startDate || endDate) {
    where.createdAt = {}
    if (startDate) where.createdAt.greater_than_equal = startDate.toISOString()
    if (endDate) where.createdAt.less_than_equal = endDate.toISOString()
  }

  // Fetch all spam comments
  const spamComments = await payload.find({
    collection: 'comments',
    where,
    limit: 1000,
    sort: '-createdAt',
  })

  // Aggregate by type
  const byType: Record<string, number> = {
    commercial: 0,
    malicious: 0,
    'off-topic': 0,
    abusive: 0,
    'bot-generated': 0,
  }

  // Aggregate by date (YYYY-MM-DD)
  const byDate: Record<string, number> = {}

  // Recent spam for detailed view
  const recentSpam: SpamAnalytics['recentSpam'] = []

  for (const comment of spamComments.docs) {
    // Count by type
    if (comment.spamType) {
      byType[comment.spamType] = (byType[comment.spamType] || 0) + 1
    }

    // Count by date
    const date = new Date(comment.createdAt).toISOString().split('T')[0]
    byDate[date] = (byDate[date] || 0) + 1

    // Add to recent spam (limit to 50)
    if (recentSpam.length < 50) {
      recentSpam.push({
        id: comment.id,
        content: comment.content.substring(0, 100),
        spamType: comment.spamType || 'unknown',
        postTitle: typeof comment.post === 'object' ? comment.post.title : 'Unknown',
        timestamp: comment.createdAt,
      })
    }
  }

  return {
    totalSpam: spamComments.totalDocs,
    byType,
    byDate,
    recentSpam,
  }
}

/**
 * Generate daily summary report for spam
 */
export async function generateDailySpamSummary(): Promise<string> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const analytics = await aggregateSpamAnalytics(today, tomorrow)

  // Generate summary text
  let summary = `Daily Spam Summary for ${today.toDateString()}\n\n`
  summary += `Total spam comments: ${analytics.totalSpam}\n\n`

  if (analytics.totalSpam > 0) {
    summary += 'Breakdown by type:\n'
    Object.entries(analytics.byType)
      .filter(([, count]) => count > 0)
      .sort(([, a], [, b]) => b - a)
      .forEach(([type, count]) => {
        summary += `  - ${type}: ${count}\n`
      })

    summary += '\nRecent spam comments:\n'
    analytics.recentSpam.slice(0, 10).forEach((spam, index) => {
      summary += `  ${index + 1}. [${spam.spamType}] ${spam.content}... (Post: ${spam.postTitle})\n`
    })
  }

  return summary
}

/**
 * Store aggregated spam data for analytics dashboard
 */
export async function storeSpamAnalytics(analytics: SpamAnalytics): Promise<void> {
  const payload = await getPayload({ config })

  // Store in admin-logs collection for historical tracking
  await payload.create({
    collection: 'admin-logs',
    data: {
      action: 'content_moderation' as const,
      resourceType: 'comments',
      resourceId: 'spam-analytics',
      user: 'system' as unknown as string,
      timestamp: new Date().toISOString(),
      details: JSON.stringify({
        totalSpam: analytics.totalSpam,
        byType: analytics.byType,
        byDate: analytics.byDate,
        generatedAt: new Date().toISOString(),
      }),
    },
  })
}
