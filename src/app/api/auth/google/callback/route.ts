import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { createPayloadOAuthSession } from '@backend/auth/oauth-session'
import type { User } from '@/shared/types/payload-types'

type LinkedProvider = NonNullable<User['linkedProviders']>[number]

interface GoogleTokenResponse {
  access_token: string
  id_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
}

interface GoogleUserInfo {
  sub: string
  email: string
  email_verified: boolean
  name: string
  given_name?: string
  family_name?: string
  picture?: string
}

/**
 * Google OAuth - Step 2: Handle callback from Google
 * GET /api/auth/google/callback
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  // Check for errors from Google
  if (error) {
    return NextResponse.redirect(
      new URL(`/login?message=${encodeURIComponent('Google sign-in was cancelled')}`, request.url),
    )
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL('/login?message=Invalid OAuth response', request.url),
    )
  }

  // Verify CSRF state
  const storedState = request.cookies.get('google-oauth-state')?.value
  if (!storedState || storedState !== state) {
    return NextResponse.redirect(
      new URL('/login?message=Invalid OAuth state. Please try again.', request.url),
    )
  }

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID!
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET!
    const redirectUri =
      process.env.GOOGLE_REDIRECT_URI ||
      `${getBaseUrl(request)}/api/auth/google/callback`

    // ── Exchange authorisation code for tokens ───────────────────────────
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenResponse.ok) {
      console.error('Google token exchange failed:', await tokenResponse.text())
      return NextResponse.redirect(
        new URL('/login?message=Failed to authenticate with Google', request.url),
      )
    }

    const tokens: GoogleTokenResponse = await tokenResponse.json()

    // ── Fetch Google profile ─────────────────────────────────────────────
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })

    if (!userInfoResponse.ok) {
      return NextResponse.redirect(
        new URL('/login?message=Failed to get Google user info', request.url),
      )
    }

    const googleUser: GoogleUserInfo = await userInfoResponse.json()

    if (!googleUser.email_verified) {
      return NextResponse.redirect(
        new URL('/login?message=Google email is not verified', request.url),
      )
    }
    
    const normalizedEmail = googleUser.email.trim().toLowerCase()

    const payload = await getPayload({ config })

    // ── Find existing user by googleSubId ──────────────────────────────────────
    let user = null
    let isNewUser = false
    
    const usersBySub = await payload.find({
      collection: 'users',
      where: { googleSubId: { equals: googleUser.sub } },
      limit: 1,
      overrideAccess: true,
    })

    if (usersBySub.docs.length > 0) {
      user = usersBySub.docs[0]
    } else {
      // ── Find existing user by email ──────────────────────────────────────
      const usersByEmail = await payload.find({
        collection: 'users',
        where: { email: { equals: normalizedEmail } },
        limit: 1,
        overrideAccess: true,
      })

      if (usersByEmail.docs.length > 0) {
        // Link Google to existing user
        user = usersByEmail.docs[0]
        
        const currentProviders: LinkedProvider[] = (user.linkedProviders || []) as LinkedProvider[]
        const newProviders: LinkedProvider[] = currentProviders.includes('google') ? currentProviders : [...currentProviders, 'google']
        
        user = await payload.update({
          collection: 'users',
          id: user.id,
          data: {
            googleSubId: googleUser.sub,
            linkedProviders: newProviders,
          },
          overrideAccess: true,
        })
      } else {
        // ── New user (Google-only) ─────────────────────────────────────────
        const tempPassword = generateSecurePassword()
        user = await payload.create({
          collection: 'users',
          data: {
            name: googleUser.name,
            email: normalizedEmail,
            password: tempPassword,
            role: 'contributor',
            bio: '',
            linkedProviders: ['google'],
            googleSubId: googleUser.sub,
          },
          overrideAccess: true,
        })
        isNewUser = true
      }
    }

    if (!user) {
      return NextResponse.redirect(
        new URL('/login?message=Failed to create or find user account', request.url),
      )
    }

    console.log('[GoogleAuth] callback resolved user', {
      userId: user.id,
      status: isNewUser ? 'newly-created' : (usersBySub.docs.length > 0 ? 'existing-google' : 'linked-by-email'),
      linkedProviders: user.linkedProviders,
      role: user.role,
      googleSubIdPresent: !!user.googleSubId
    })

    // ── Create Payload Session Safely ────────────────────────────
    // This removes the dangerous temp password overwrite hack.
    const { token, cookieName } = await createPayloadOAuthSession({
      payload,
      user,
    })

    // ── Determine redirect path ──────────────────────────────────────────
    let redirectPath: string

    if (isNewUser) {
      redirectPath = '/set-password'
    } else {
      const savedRedirect = request.cookies.get('google-oauth-redirect')?.value
      const typedUser = user as unknown as { isAdmin?: boolean; role?: string }
      redirectPath =
        savedRedirect && savedRedirect.startsWith('/')
          ? savedRedirect
          : typedUser?.isAdmin
            ? '/admin-dashboard'
            : typedUser?.role === 'editor'
              ? '/editor'
              : '/contributor'
    }

    console.log('[GoogleAuth] session helper completed', {
      userId: user.id,
      redirectTarget: redirectPath
    })

    const response = NextResponse.redirect(new URL(redirectPath, request.url))

    // Set auth cookie explicitly on the response object to guarantee Next.js redirect picks it up
    const collectionConfig = payload.collections['users'].config
    const tokenExpiration = collectionConfig.auth?.tokenExpiration || 7200

    response.cookies.set(cookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: tokenExpiration,
    })

    // Clean up OAuth cookies
    response.cookies.delete('google-oauth-state')
    response.cookies.delete('google-oauth-redirect')

    return response
  } catch (error) {
    console.error('Google OAuth callback error:', error)
    return NextResponse.redirect(
      new URL('/login?message=An error occurred during Google sign-in', request.url),
    )
  }
}

function getBaseUrl(request: NextRequest): string {
  const proto = request.headers.get('x-forwarded-proto') || 'http'
  const host = request.headers.get('host') || 'localhost:3000'
  return `${proto}://${host}`
}

function generateSecurePassword(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, (b) => chars[b % chars.length]).join('')
}
