import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { checkRateLimit, createRateLimitResponse } from '@shared/lib/rate-limit'

/**
 * POST /api/track - Record a page view
 * Called by the client-side tracker component
 */
export async function POST(req: NextRequest) {
  // Rate limiting: max 100 requests per hour per IP
  const rateLimitResult = await checkRateLimit(req, {
    maxRequests: 100,
    windowMs: 60 * 60 * 1000, // 1 hour
  })

  if (!rateLimitResult.success) {
    return createRateLimitResponse(rateLimitResult)
  }

  try {
    const body = await req.json()
    const { path, postSlug } = body

    if (!path || typeof path !== 'string') {
      return NextResponse.json({ error: 'path is required' }, { status: 400 })
    }

    const payload = await getPayload({ config: configPromise })

    // Parse user agent for device/browser
    const userAgent = req.headers.get('user-agent') || ''
    const referrer = req.headers.get('referer') || body.referrer || ''

    const device = detectDevice(userAgent)
    const browser = detectBrowser(userAgent)

    // Try to get country from common CDN headers
    const country =
      req.headers.get('cf-ipcountry') ||
      req.headers.get('x-vercel-ip-country') ||
      req.headers.get('x-country') ||
      ''

    // Generate a session ID from IP + user agent (anonymous, privacy-friendly)
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const sessionId = await hashSessionId(`${ip}-${userAgent}-${new Date().toDateString()}`)

    // Look up post ID if slug provided
    let postId: string | undefined
    if (postSlug) {
      const postResult = await payload.find({
        collection: 'posts',
        where: { slug: { equals: postSlug } },
        limit: 1,
        depth: 0,
      })
      if (postResult.docs.length > 0) {
        postId = String(postResult.docs[0].id)
      }
    }

    const pageViewData: Record<string, unknown> = {
      path,
      sessionId,
      referrer: referrer.substring(0, 500),
      userAgent: userAgent.substring(0, 500),
      country,
      device,
      browser,
      viewedAt: new Date().toISOString(),
    }
    if (postSlug) pageViewData.postSlug = postSlug
    if (postId) pageViewData.post = postId

    await payload.create({
      collection: 'page-views',
      data: pageViewData as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

function detectDevice(ua: string): 'desktop' | 'mobile' | 'tablet' | 'unknown' {
  const lower = ua.toLowerCase()
  if (/ipad|tablet|playbook|silk/.test(lower)) return 'tablet'
  if (/mobile|iphone|ipod|android.*mobile|windows phone|blackberry|opera mini|iemobile/.test(lower)) return 'mobile'
  if (/windows|macintosh|linux|cros/.test(lower)) return 'desktop'
  return 'unknown'
}

function detectBrowser(ua: string): string {
  if (ua.includes('Firefox/')) return 'Firefox'
  if (ua.includes('Edg/')) return 'Edge'
  if (ua.includes('OPR/') || ua.includes('Opera/')) return 'Opera'
  if (ua.includes('Chrome/') && !ua.includes('Edg/')) return 'Chrome'
  if (ua.includes('Safari/') && !ua.includes('Chrome/')) return 'Safari'
  return 'Other'
}

async function hashSessionId(input: string): Promise<string> {
  // Use Web Crypto API (available in Edge Runtime and Node 18+)
  const encoder = new TextEncoder()
  const data = encoder.encode(input)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('').substring(0, 16)
}
