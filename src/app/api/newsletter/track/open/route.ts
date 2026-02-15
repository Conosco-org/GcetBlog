/**
 * Newsletter Open Tracking Pixel Endpoint
 *
 * GET /api/newsletter/track/open?nid={newsletterId}&sid={subscriberId}
 *
 * Returns a 1x1 transparent GIF. Records an "opened" event.
 * Deduplicates: only first open per subscriber per newsletter is recorded.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

// 1x1 transparent GIF (43 bytes)
const TRANSPARENT_GIF = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64',
)

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const newsletterId = searchParams.get('nid')
  const subscriberId = searchParams.get('sid')

  // Always return the GIF, even if params are missing — don't break email rendering
  const gifResponse = () =>
    new NextResponse(TRANSPARENT_GIF, {
      status: 200,
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    })

  if (!newsletterId || !subscriberId) {
    return gifResponse()
  }

  try {
    const payload = await getPayload({ config: configPromise })

    // Deduplicate: check if we already recorded an open for this combo
    const existing = await payload.find({
      collection: 'newsletter-events',
      where: {
        and: [
          { newsletter: { equals: newsletterId } },
          { subscriber: { equals: subscriberId } },
          { type: { equals: 'opened' } },
        ],
      },
      limit: 1,
      depth: 0,
    })

    if (existing.docs.length === 0) {
      // Record the open event
      await payload.create({
        collection: 'newsletter-events',
        data: {
          newsletter: newsletterId,
          subscriber: subscriberId,
          type: 'opened',
          userAgent: request.headers.get('user-agent') ?? undefined,
          ipAddress:
            request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
            request.headers.get('x-real-ip') ??
            undefined,
          timestamp: new Date().toISOString(),
        },
      })
    }
  } catch (err) {
    // Silently fail — never break the email rendering experience
    console.error('[Newsletter Track Open] Error:', err)
  }

  return gifResponse()
}
