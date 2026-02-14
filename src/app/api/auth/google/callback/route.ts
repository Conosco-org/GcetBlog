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

    // Exchange code for tokens
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

    // Get user info from Google
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

    // Check if user already exists
    const existingUsers = await payload.find({
      collection: 'users',
      where: { email: { equals: googleUser.email } },
      limit: 1,
    })

    let user
    let _isNewUser = false

    if (existingUsers.docs.length > 0) {
      // Existing user — update Google info if needed
      user = existingUsers.docs[0]
      if (user) {
        // Update avatar from Google if user doesn't have one
        if (!user.avatar && googleUser.picture) {
          await payload.update({
            collection: 'users',
            id: user.id,
            data: {
              // Store Google picture URL in a way we can use later
              // Note: We don't upload to media here to keep it simple
            },
          })
        }
      }
    } else {
      // Create new user with Google info
      // Generate a random password since Google users won't use it
      const randomPassword = generateSecurePassword()
      
      user = await payload.create({
        collection: 'users',
        data: {
          name: googleUser.name,
          email: googleUser.email,
          password: randomPassword,
          role: 'contributor',
          bio: '',
        },
      })
      _isNewUser = true
    }

    if (!user) {
      return NextResponse.redirect(
        new URL('/login?message=Failed to create or find user account', request.url),
      )
    }

    // Log the user in by creating a Payload token
    // We use payload.login with the email to generate a proper JWT
    // Since Google users have random passwords, we use the internal login mechanism
    const loginResult = await payload.login({
      collection: 'users',
      data: {
        email: googleUser.email,
        password: '', // Won't work with regular login
      },
    }).catch(async () => {
      // If regular login fails (expected for Google-created users),
      // we generate a token directly
      return null
    })

    // Generate token manually if login failed
    let token: string | undefined

    if (loginResult?.token) {
      token = loginResult.token
    } else {
      // For Google SSO, we need to generate the token ourselves
      // This uses Payload's internal auth mechanism
      const jwt = await import('jsonwebtoken')
      const payloadSecret = process.env.PAYLOAD_SECRET

      if (!payloadSecret) {
        throw new Error('PAYLOAD_SECRET is required')
      }

      token = jwt.default.sign(
        {
          id: user.id,
          email: user.email,
          collection: 'users',
        },
        payloadSecret,
        { expiresIn: '7d' },
      )
    }

    if (!token) {
      return NextResponse.redirect(
        new URL('/login?message=Failed to generate session token', request.url),
      )
    }

    // Determine redirect path
    const savedRedirect = request.cookies.get('google-oauth-redirect')?.value
    const typedUser = user as unknown as { isAdmin?: boolean; role?: string }
    const redirectPath =
      savedRedirect && savedRedirect.startsWith('/')
        ? savedRedirect
        : typedUser?.isAdmin
          ? '/admin-dashboard'
          : typedUser?.role === 'editor'
            ? '/editor'
            : '/contributor'

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
