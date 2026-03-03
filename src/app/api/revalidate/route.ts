import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { CONOSCO_CACHE_TAGS } from '@/services/conosco/cached'

/**
 * POST /api/revalidate
 *
 * Manually invalidate cached Conosco data.
 * Protected by REVALIDATION_SECRET environment variable.
 *
 * Body: { tags?: string[] }
 * If no tags provided, all Conosco cache tags are invalidated.
 *
 * Valid tags: conosco-events, conosco-clubs, conosco-stats, conosco-health
 */
export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATION_SECRET

  // Verify authorization
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!secret || token !== secret) {
    return NextResponse.json(
      { success: false, message: 'Invalid or missing authorization token' },
      { status: 401 },
    )
  }

  try {
    const body = await request.json().catch(() => ({}))
    const requestedTags: string[] = body.tags || []

    const validTags = Object.values(CONOSCO_CACHE_TAGS)

    // If specific tags requested, validate them
    const tagsToRevalidate = requestedTags.length > 0
      ? requestedTags.filter((tag) => (validTags as string[]).includes(tag))
      : validTags

    if (tagsToRevalidate.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'No valid tags provided',
          validTags,
        },
        { status: 400 },
      )
    }

    // Revalidate each tag
    for (const tag of tagsToRevalidate) {
      revalidateTag(tag)
    }

    return NextResponse.json({
      success: true,
      message: `Revalidated ${tagsToRevalidate.length} cache tag(s)`,
      revalidatedTags: tagsToRevalidate,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 },
    )
  }
}

/**
 * GET /api/revalidate — Return available tags (unauthenticated, for discovery)
 */
export async function GET() {
  return NextResponse.json({
    availableTags: Object.values(CONOSCO_CACHE_TAGS),
    usage: 'POST /api/revalidate with Bearer token and optional { tags: [...] } body',
  })
}
