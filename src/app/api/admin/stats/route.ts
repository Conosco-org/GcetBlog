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

    // Only admins (isAdmin=true) can access stats
    const typedUser = user as { isAdmin?: boolean }
    if (!typedUser.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch all stats in parallel
    const [
      totalPosts,
      totalUsers,
      totalMedia,
    ] = await Promise.all([
      payload.count({
        collection: 'posts',
        where: { _status: { equals: 'published' } },
      }),
      payload.count({ collection: 'users' }),
      payload.count({ collection: 'media' }),
    ])

    // Get posts published today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const publishedToday = await payload.count({
      collection: 'posts',
      where: {
        _status: { equals: 'published' },
        publishedAt: { greater_than: today.toISOString() },
      },
    })

    return NextResponse.json({
      totalPosts: totalPosts.totalDocs,
      totalUsers: totalUsers.totalDocs,
      publishedToday: publishedToday.totalDocs,
      totalMedia: totalMedia.totalDocs,
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
