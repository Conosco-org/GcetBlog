/**
 * OAuth State & Finalize Ticket utilities — Multi-Domain Google OAuth
 *
 * Problem: Google OAuth requires a single, pre-registered redirect_uri.
 * When multiple institutions run on separate custom domains, the OAuth
 * callback must land on the platform domain, then hand the session back
 * to the originating institution domain.
 *
 * Solution: encode the originating domain and redirect intent into an
 * HMAC-signed `state` parameter. The callback builds a short-lived
 * signed "finalize ticket" and redirects to
 *   {origin}/api/auth/google/finalize?ticket=...
 * The finalize route verifies the ticket and sets the auth cookie on the
 * correct domain.
 *
 * Token format: base64url(json) + '.' + base64url(HMAC-SHA256)
 */
import { createHmac, timingSafeEqual } from 'crypto'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Embedded in the OAuth `state` parameter sent to Google */
export interface OAuthState {
  /** Random nonce (replay prevention) */
  nonce: string
  /**
   * Full origin URL of the initiating domain.
   * e.g., "https://digital.gcet.edu.in" or "http://localhost:3000"
   */
  origin: string
  /** Desired post-login redirect path, e.g. "/user" */
  redirectTo?: string
  /** Issued-at (Unix seconds) */
  iat: number
}

/** Short-lived ticket passed from platform callback → institution finalize */
export interface FinalizeTicket {
  /** Payload JWT to set as cookie on the institution domain */
  payloadToken: string
  /** Post-login destination path */
  redirectPath: string
  /** Issued-at (Unix seconds) */
  iat: number
}

// ---------------------------------------------------------------------------
// HMAC helpers
// ---------------------------------------------------------------------------

const getSecret = (suffix = '') =>
  (process.env.GOOGLE_STATE_SECRET ?? process.env.PAYLOAD_SECRET ?? '') + suffix

/**
 * Encode an object into a HMAC-signed token: `base64url(json).base64url(sig)`
 *
 * @param data   JSON-serialisable object
 * @param suffix Key-derivation suffix so different token types can't be
 *               confused with each other (e.g., ':state', ':finalize')
 */
export function signToken(data: object, suffix = ''): string {
  const payload = Buffer.from(JSON.stringify(data)).toString('base64url')
  const sig = createHmac('sha256', getSecret(suffix)).update(payload).digest('base64url')
  return `${payload}.${sig}`
}

/**
 * Verify and decode a signed token.
 * Returns `null` if the signature doesn't match or the token has expired.
 *
 * Uses constant-time comparison to prevent timing attacks.
 */
export function verifyToken<T extends { iat: number }>(
  token: string,
  suffix = '',
  maxAgeSeconds = 600,
): T | null {
  try {
    const dotIdx = token.lastIndexOf('.')
    if (dotIdx === -1) return null

    const payload = token.slice(0, dotIdx)
    const sig = token.slice(dotIdx + 1)

    const expected = createHmac('sha256', getSecret(suffix)).update(payload).digest('base64url')

    const sigBuf = Buffer.from(sig, 'base64url')
    const expBuf = Buffer.from(expected, 'base64url')

    // timingSafeEqual requires same-length TypedArrays; unequal length = fail
    if (sigBuf.length !== expBuf.length) return null
    if (!timingSafeEqual(new Uint8Array(sigBuf), new Uint8Array(expBuf))) return null

    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8')) as T
    const now = Math.floor(Date.now() / 1000)
    if (now - data.iat > maxAgeSeconds) return null

    return data
  } catch {
    return null
  }
}

/** Generate a cryptographically random hex nonce */
export function generateNonce(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('')
}
