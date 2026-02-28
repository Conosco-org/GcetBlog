/**
 * Newsletter Click Tracking Endpoint
 *
 * GET /api/newsletter/track/click?nid={newsletterId}&sid={subscriberId}&url={encodedUrl}
 *
 * Records a "clicked" event and 302 redirects to the actual URL.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const newsletterId = searchParams.get('nid')
  const subscriberId = searchParams.get('sid')
  const targetUrl = searchParams.get('url')

  // If no target URL, redirect to homepage
  if (!targetUrl) {
    return NextResponse.redirect(
      new URL('/', request.url),
      { status: 302 },
    )
  }

  // Record the click asynchronously - don't delay the redirect
  if (newsletterId && subscriberId) {
    try {
      const payload = await getPayload({ config: configPromise })

      // Record click event (we DO allow multiple clicks - they clicked different links)
      await payload.create({
        collection: 'newsletter-events',
        data: {
          newsletter: newsletterId,
          subscriber: subscriberId,
          type: 'clicked',
          url: targetUrl,
          userAgent: request.headers.get('user-agent') ?? undefined,
          ipAddress:
            request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
            request.headers.get('x-real-ip') ??
            undefined,
          timestamp: new Date().toISOString(),
        },
      })
    } catch (err) {
      // Silently fail - always redirect regardless
      console.error('[Newsletter Track Click] Error:', err)
    }
  }

  // 302 redirect to actual destination
  return NextResponse.redirect(targetUrl, { status: 302 })
}
