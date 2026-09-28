import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { createPayloadOAuthSession } from '@backend/auth/oauth-session'
import { createRemoteJWKSet, jwtVerify } from 'jose'
import type { User } from '@/shared/types/payload-types'

type LinkedProvider = NonNullable<User['linkedProviders']>[number]

interface MicrosoftTokenResponse {
  access_token: string
  id_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  // Check for errors from Microsoft
  if (error) {
    return NextResponse.redirect(
      new URL(`/login?message=${encodeURIComponent('Microsoft sign-in failed or was cancelled')}`, request.url),
    )
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL('/login?message=Invalid OAuth response', request.url),
    )
  }

  // 1. Validate OAuth state
  const storedState = request.cookies.get('microsoft-oauth-state')?.value
  if (!storedState || storedState !== state) {
    return NextResponse.redirect(
      new URL('/login?message=Invalid OAuth state. Please try again.', request.url),
    )
  }

  try {
    const tenantId = process.env.MICROSOFT_TENANT_ID!
    const clientId = process.env.MICROSOFT_CLIENT_ID!
    const clientSecret = process.env.MICROSOFT_CLIENT_SECRET!
    const redirectUri =
      process.env.MICROSOFT_REDIRECT_URI ||
      `${getBaseUrl(request)}/api/auth/microsoft/callback`

    // 2. Exchange authorization code for tokens
    const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`
    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenResponse.ok) {
      console.error('Microsoft token exchange failed:', await tokenResponse.text())
      return NextResponse.redirect(
        new URL('/login?message=Failed to authenticate with Microsoft', request.url),
      )
    }

    const tokens: MicrosoftTokenResponse = await tokenResponse.json()
    if (!tokens.id_token) {
      return NextResponse.redirect(
        new URL('/login?message=No ID token returned from Microsoft', request.url),
      )
    }

    // 3. Cryptographically verify the ID token using jose and Microsoft's JWKS
    const jwksUri = `https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`
    const JWKS = createRemoteJWKSet(new URL(jwksUri))

    const { payload: jwtClaims } = await jwtVerify(tokens.id_token, JWKS, {
      issuer: `https://login.microsoftonline.com/${tenantId}/v2.0`,
      audience: clientId,
    })

    // 4. Strict Tenant Check
    const tid = jwtClaims.tid as string
    if (tid !== tenantId) {
      console.warn(`Tenant mismatch: token tid=${tid}, expected=${tenantId}`)
      return NextResponse.redirect(
        new URL('/login?message=This Microsoft account is not a GCET work or school account.', request.url),
      )
    }

    // 5. Determine the most reliable identifier and check GCET domain
    const emailClaim = (jwtClaims.preferred_username || jwtClaims.email || jwtClaims.upn) as string | undefined
    if (!emailClaim) {
      return NextResponse.redirect(
        new URL('/login?message=No email associated with Microsoft account', request.url),
      )
    }

    const normalizedEmail = emailClaim.trim().toLowerCase()
    if (!normalizedEmail.endsWith('@gcet.edu.in')) {
      return NextResponse.redirect(
        new URL('/login?message=Please use your @gcet.edu.in work or school account.', request.url),
      )
    }

    const oid = jwtClaims.oid as string
    if (!oid) {
      return NextResponse.redirect(
        new URL('/login?message=Invalid Microsoft identity (missing oid)', request.url),
      )
    }

    const payload = await getPayload({ config })

    let user = null
    let isNewUser = false

    // 6. Existing Microsoft User Lookup (FIRST lookup by oid and tid)
    const usersByMs = await payload.find({
      collection: 'users',
      where: {
        and: [
          { microsoftSubId: { equals: oid } },
          { microsoftTenantId: { equals: tid } },
        ],
      },
      limit: 1,
      overrideAccess: true,
    })

    if (usersByMs.docs.length > 0) {
      user = usersByMs.docs[0]
    } else {
      // 7. First-Time Microsoft Linking (fallback to email)
      const usersByEmail = await payload.find({
        collection: 'users',
        where: { email: { equals: normalizedEmail } },
        limit: 1,
        overrideAccess: true,
      })

      if (usersByEmail.docs.length > 0) {
        user = usersByEmail.docs[0]
        
        // Conflict Protection: If the user already has a different microsoftSubId linked, reject safely
        if (user.microsoftSubId && user.microsoftSubId !== oid) {
          console.error(`Identity conflict: Email ${normalizedEmail} belongs to a user with MS oid ${user.microsoftSubId}, but login attempted with oid ${oid}.`)
          return NextResponse.redirect(
            new URL('/login?message=We couldn\'t safely link this Microsoft account. Please contact an administrator.', request.url),
          )
        }

        const currentProviders: LinkedProvider[] = (user.linkedProviders || []) as LinkedProvider[]
        const newProviders: LinkedProvider[] = currentProviders.includes('microsoft') ? currentProviders : [...currentProviders, 'microsoft']
        
        user = await payload.update({
          collection: 'users',
          id: user.id,
          data: {
            microsoftSubId: oid,
            microsoftTenantId: tid,
            linkedProviders: newProviders,
          },
          overrideAccess: true,
        })
      } else {
        // CASE B — no user found. Create one.
        // We use a cryptographically secure random password that the user doesn't know and won't use.
        // This is safe because Payload requires a password for 'auth: true' collections on creation.
        // The user will log in via OAuth instead.
        const tempPassword = generateSecurePassword()
        user = await payload.create({
          collection: 'users',
          data: {
            name: (jwtClaims.name as string) || normalizedEmail.split('@')[0],
            email: normalizedEmail,
            password: tempPassword,
            role: 'contributor',
            bio: '',
            linkedProviders: ['microsoft'],
            microsoftSubId: oid,
            microsoftTenantId: tid,
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

    // 8. Create Payload Session Safely
    const { token, cookieName } = await createPayloadOAuthSession({
      payload,
      user,
    })

    // Determine redirect path
    let redirectPath: string

    if (isNewUser) {
      // First time users might still want to set a local password, 
      // or we can redirect them to dashboard. We'll use the same as Google for consistency if needed, 
      // but let's just use dashboard logic.
      redirectPath = '/contributor' 
      // Note: we could redirect to /set-password, but let's just go to dashboard for now
      // Actually, for Google we redirected to '/set-password' for new users. Let's do the same.
      redirectPath = '/set-password'
    } else {
      const savedRedirect = request.cookies.get('microsoft-oauth-redirect')?.value
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

    const collectionConfig = payload.collections['users'].config
    const tokenExpiration = collectionConfig.auth?.tokenExpiration || 7200

    response.cookies.set(cookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: tokenExpiration,
    })

    // Clean up OAuth state cookies
    response.cookies.delete('microsoft-oauth-state')
    response.cookies.delete('microsoft-oauth-redirect')

    return response
  } catch (error) {
    console.error('Microsoft OAuth callback error:', error)
    return NextResponse.redirect(
      new URL('/login?message=An error occurred during Microsoft sign-in', request.url),
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
