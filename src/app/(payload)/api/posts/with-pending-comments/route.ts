import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'

/**
 * GET /api/posts/with-pending-comments
 * Returns posts with pending comment counts and reported comment counts
 * Validates: Requirements 7.1, 7.2, 7.3
 */
export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const requestHeaders = await headers()

    // Authenticate user
    const { user } = await payload.auth({ headers: requestHeaders })

    // Allow both editors and admins to access this endpoint
    const userRole = (user as { role?: string })?.role
    if (!user || (userRole !== 'editor' && userRole !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const page = Math.max(1, Number(searchParams.get('page')) || 1)
    const limit = Math.max(1, Math.min(100, Number(searchParams.get('limit')) || 50))

    // Fetch all published posts
    const postsResult = await payload.find({
      collection: 'posts',
      where: {
        _status: { equals: 'published' },
      },
      limit,
      page,
      sort: '-createdAt',
    })

    // For each post, count pending and reported comments
    const postsWithCounts = await Promise.all(
      postsResult.docs.map(async (post) => {
        const [pendingCount, reportedCount] = await Promise.all([
          payload.count({
            collection: 'comments',
            where: {
              and: [
                { post: { equals: post.id } },
                { status: { equals: 'pending' } },
              ],
            },
          }),
          payload.count({
            collection: 'comments',
            where: {
              and: [
                { post: { equals: post.id } },
                { reportedBy: { exists: true } },
                { reportResolvedAt: { exists: false } },
              ],
            },
          }),
        ])

        return {
          id: post.id,
          title: post.title,
          slug: post.slug,
          heroImage: post.heroImage
            ? typeof post.heroImage === 'object'
              ? {
                  url: (post.heroImage as { url?: string }).url,
                  alt: (post.heroImage as { alt?: string }).alt,
                }
              : undefined
            : undefined,
          pendingCommentCount: pendingCount.totalDocs,
          reportedCommentCount: reportedCount.totalDocs,
        }
      }),
    )

    // Filter to only posts with pending comments and sort by count descending
    const filteredPosts = postsWithCounts
      .filter((post) => post.pendingCommentCount > 0)
      .sort((a, b) => b.pendingCommentCount - a.pendingCommentCount)

    return NextResponse.json({
      posts: filteredPosts,
      totalDocs: filteredPosts.length,
      page,
      limit,
    })
  } catch (error) {
    console.error('Error fetching posts with pending comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 },
    )
  }
}
