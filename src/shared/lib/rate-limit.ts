/**
 * Simple in-memory rate limiter for API routes
 * For production, consider using Redis or a dedicated rate limiting service
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed in the time window
   */
  maxRequests: number
  /**
   * Time window in milliseconds
   */
  windowMs: number
  /**
   * Optional custom identifier (defaults to IP address)
   */
  identifier?: string
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

/**
 * Check if a request should be rate limited
 * @param request - The Next.js request object
 * @param config - Rate limit configuration
 * @returns Rate limit result with success status and metadata
 */
export async function checkRateLimit(
  request: Request,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const { maxRequests, windowMs, identifier } = config

  // Get identifier (IP address or custom identifier)
  const key = identifier || getClientIdentifier(request)
  const now = Date.now()

  // Get or create rate limit entry
  let entry = rateLimitStore.get(key)

  if (!entry || entry.resetAt < now) {
    // Create new entry or reset expired entry
    entry = {
      count: 0,
      resetAt: now + windowMs,
    }
    rateLimitStore.set(key, entry)
  }

  // Increment count
  entry.count++

  // Check if limit exceeded
  const success = entry.count <= maxRequests
  const remaining = Math.max(0, maxRequests - entry.count)

  return {
    success,
    limit: maxRequests,
    remaining,
    reset: entry.resetAt,
  }
}

/**
 * Get client identifier from request (IP address)
 */
function getClientIdentifier(request: Request): string {
  // Try to get IP from common headers
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown'
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  if (cfConnectingIp) {
    return cfConnectingIp
  }

  return 'unknown'
}

/**
 * Create rate limit response with appropriate headers
 */
export function createRateLimitResponse(result: RateLimitResult) {
  return new Response(
    JSON.stringify({
      success: false,
      error: 'Too many requests. Please try again later.',
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': new Date(result.reset).toISOString(),
        'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
      },
    }
  )
}
