import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const payload = await getPayload({ config: configPromise })
    const requestHeaders = await headers()

    // Authenticate the request
    const { user } = await payload.auth({ headers: requestHeaders })

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can access stats
    const typedUser = user as { role?: string }
    if (typedUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch all stats in parallel
    const [
      totalPages,
      totalUsers,
      pendingApprovals,
      totalMedia,
    ] = await Promise.all([
      payload.count({ collection: 'pages' }),
      payload.count({ collection: 'users' }),
      payload.count({
        collection: 'role-upgrade-requests',
        where: { status: { equals: 'pending' } },
      }),
      payload.count({ collection: 'admin-logs' }),
    ])

    // Get pages published today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const publishedToday = await payload.count({
      collection: 'pages',
      where: {
        _status: { equals: 'published' },
        publishedAt: { greater_than: today.toISOString() },
      },
    })

    return NextResponse.json({
      totalPosts: totalPages.totalDocs, // Using totalPosts key for compatibility
      totalUsers: totalUsers.totalDocs,
      pendingApprovals: pendingApprovals.totalDocs,
      publishedToday: publishedToday.totalDocs,
      totalMedia: totalMedia.totalDocs, // Actually admin logs count
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
