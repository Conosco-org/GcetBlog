import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function GET(request: NextRequest) {
  try {
    const tenantId = process.env.MICROSOFT_TENANT_ID
    const clientId = process.env.MICROSOFT_CLIENT_ID
    
    if (!tenantId || !clientId) {
      console.error('Missing Microsoft OAuth environment variables')
      return NextResponse.redirect(
        new URL('/login?message=Microsoft sign-in is not configured', request.url),
      )
    }

    // Generate cryptographically strong state
    const state = crypto.randomBytes(32).toString('hex')
    
    // Redirect URI
    const proto = request.headers.get('x-forwarded-proto') || 'http'
    const host = request.headers.get('host') || 'localhost:3000'
    const redirectUri =
      process.env.MICROSOFT_REDIRECT_URI ||
      `${proto}://${host}/api/auth/microsoft/callback`

    // Construct authorization URL targeting the GCET tenant specifically
    const authUrl = new URL(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize`)
    authUrl.searchParams.set('client_id', clientId)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('response_mode', 'query')
    authUrl.searchParams.set('scope', 'openid profile email')
    authUrl.searchParams.set('state', state)
    // Optional: prompt=select_account is useful if the user is already logged in to multiple MS accounts
    authUrl.searchParams.set('prompt', 'select_account')

    const response = NextResponse.redirect(authUrl.toString())

    // Store state in a short-lived cookie for CSRF protection
    response.cookies.set('microsoft-oauth-state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 10, // 10 minutes
    })

    // Capture the original referring URL if we want to redirect them back
    const referer = request.headers.get('referer')
    if (referer) {
      const refererUrl = new URL(referer)
      if (refererUrl.pathname !== '/login') {
        response.cookies.set('microsoft-oauth-redirect', refererUrl.pathname, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 10,
        })
      }
    }

    return response
  } catch (error) {
    console.error('Microsoft OAuth initialization error:', error)
    return NextResponse.redirect(
      new URL('/login?message=An error occurred starting Microsoft sign-in', request.url),
    )
  }
}
