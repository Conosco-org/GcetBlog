import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

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
 *
 * Scenarios:
 *   A) New user (no account) → create with authProvider='google', googleSubId set.
 *   B) Existing local-only user → link Google, upgrade authProvider to 'both',
 *      **preserve** their original password so email login still works.
 *   C) Existing google/both user → just log them in, password untouched.
 *
 * Token strategy:
 *   We need a Payload-minted JWT so the middleware trusts it. For
 *   existing users whose password we must not lose, we:
 *     1. Read the raw hash+salt from MongoDB.
 *     2. Set a temp password → call payload.login() → get JWT.
 *     3. Restore the original hash+salt immediately after.
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

    const payload = await getPayload({ config })

    // ── Find existing user by email ──────────────────────────────────────
    const existingUsers = await payload.find({
      collection: 'users',
      where: { email: { equals: googleUser.email } },
      limit: 1,
      overrideAccess: true,
    })

    const tempPassword = generateSecurePassword()
    let user
    let savedHash: string | null = null
    let savedSalt: string | null = null
    let isNewUser = false

    if (existingUsers.docs.length > 0) {
      // ── Existing user ────────────────────────────────────────────────
      user = existingUsers.docs[0]
      const currentProvider = (user as unknown as Record<string, unknown>).authProvider as
        | string
        | undefined

      // 1. Read original hash+salt from MongoDB so we can restore them
      //    after the temp-password login.
      const db = (payload.db as unknown as { connection: { db: { collection: (n: string) => { findOne: (q: Record<string, unknown>) => Promise<Record<string, unknown> | null> } } } }).connection?.db
      if (db) {
        const rawUser = await db.collection('users').findOne({ email: googleUser.email })
        if (rawUser) {
          savedHash = (rawUser.hash as string) ?? null
          savedSalt = (rawUser.salt as string) ?? null
        }
      }

      // 2. Set temp password so payload.login() works
      const updateData: Record<string, unknown> = {
        password: tempPassword,
        googleSubId: googleUser.sub,
      }

      // Upgrade authProvider: local → both, undefined → both
      if (!currentProvider || currentProvider === 'local') {
        updateData.authProvider = 'both'
      }
      // If already 'google' or 'both', leave as-is

      await payload.update({
        collection: 'users',
        id: user.id,
        data: updateData,
        overrideAccess: true,
      })
    } else {
      // ── New user (Google-only) ─────────────────────────────────────────
      user = await payload.create({
        collection: 'users',
        data: {
          name: googleUser.name,
          email: googleUser.email,
          password: tempPassword,
          role: 'contributor',
          bio: '',
          authProvider: 'google',
          googleSubId: googleUser.sub,
        },
        overrideAccess: true,
      })
      isNewUser = true
    }

    if (!user) {
      return NextResponse.redirect(
        new URL('/login?message=Failed to create or find user account', request.url),
      )
    }

    // ── Log in via Payload to get a valid JWT ────────────────────────────
    const loginResult = await payload.login({
      collection: 'users',
      data: {
        email: googleUser.email,
        password: tempPassword,
      },
    })

    const token = loginResult?.token

    // ── Restore original password hash for existing users ────────────────
    // This ensures their email/password login still works.
    if (savedHash && savedSalt) {
      const db = (payload.db as unknown as { connection: { db: { collection: (n: string) => { updateOne: (q: Record<string, unknown>, u: Record<string, unknown>) => Promise<unknown> } } } }).connection?.db
      if (db) {
        await db.collection('users').updateOne(
          { email: googleUser.email },
          { $set: { hash: savedHash, salt: savedSalt } },
        )
      }
    }

    if (!token) {
      return NextResponse.redirect(
        new URL('/login?message=Failed to generate session token', request.url),
      )
    }

    // ── Determine redirect path ──────────────────────────────────────────
    // New users go to /set-password to create their email login credentials.
    // Existing users go to their dashboard (or saved redirect).
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

    const response = NextResponse.redirect(new URL(redirectPath, request.url))

    // Set auth cookie
    response.cookies.set('payload-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
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
