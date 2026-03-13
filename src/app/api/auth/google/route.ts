import { NextRequest, NextResponse } from 'next/server'
import { signToken, generateNonce, type OAuthState } from '@/utilities/oauthState'

/**
 * Google OAuth — Step 1: Redirect to Google consent screen
 * GET /api/auth/google
 *
 * The originating domain (origin) and post-login redirect path are encoded
 * into an HMAC-signed `state` parameter. This replaces the old cookie-based
 * state — the HMAC is the CSRF protection, and it works across domains.
 *
 * In production GOOGLE_REDIRECT_URI must point to the platform domain
 * (e.g., https://platform.conosco.in/api/auth/google/callback) — the single
 * redirect_uri registered in Google Cloud Console.
 */
export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const redirectUri = getGoogleCallbackUri(request)

  if (!clientId) {
    return NextResponse.json(
      { error: 'Google OAuth is not configured. Set GOOGLE_CLIENT_ID environment variable.' },
      { status: 500 },
    )
  }

  const origin = getBaseUrl(request)
  const redirectTo = request.nextUrl.searchParams.get('redirect') ?? undefined

  const statePayload: OAuthState = {
    nonce: generateNonce(),
    origin,
    redirectTo,
    iat: Math.floor(Date.now() / 1000),
  }

  const state = signToken(statePayload, ':oauth-state')

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'offline',
    prompt: 'consent',
  })

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
  )
}

/**
 * The fixed OAuth callback URI — always the platform domain in production.
 * In development falls back to the current request host.
 */
function getGoogleCallbackUri(request: NextRequest): string {
  return process.env.GOOGLE_REDIRECT_URI ?? `${getBaseUrl(request)}/api/auth/google/callback`
}

function getBaseUrl(request: NextRequest): string {
  const proto = request.headers.get('x-forwarded-proto') || 'http'
  const host = request.headers.get('host') || 'localhost:3000'
  return `${proto}://${host}`
}
