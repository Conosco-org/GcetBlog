import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { verifyToken, signToken, type OAuthState, type FinalizeTicket } from '@/utilities/oauthState'
import { resolveTenant } from '@/utilities/tenantResolver'
import type { Institution, User } from '@/payload-types'

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
 * Google OAuth — Step 2: Handle callback from Google
 * GET /api/auth/google/callback
 *
 * This route MUST run on the platform domain (e.g., platform.conosco.in)
 * because Google only allows a single pre-registered redirect_uri.
 *
 * Multi-domain flow:
 *   1. Verify HMAC-signed `state` (prevents CSRF, contains originating domain)
 *   2. Exchange code → tokens → Google user info
 *   3. Resolve institution from the origin domain embedded in state
 *   4. Create/link user (with institution assigned on creation)
 *   5. Run institution scope check for existing users (unless superadmin)
 *   6. Mint Payload JWT via temp-password trick
 *   7. Build short-lived finalize ticket and redirect to:
 *      {origin}/api/auth/google/finalize?ticket=...
 *
 * The finalize route (on the institution domain) sets the auth cookie.
 *
 * Scenarios:
 *   A) New user  → create with institution from origin, redirect to /set-password
 *   B) Existing user, same institution → link Google, log in
 *   C) Existing user, wrong institution → block with helpful error
 *   D) SuperAdmin → bypass institution check, redirect to /platform
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const code = searchParams.get('code')
  const stateParam = searchParams.get('state')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?message=${encodeURIComponent('Google sign-in was cancelled')}`, request.url),
    )
  }

  if (!code || !stateParam) {
    return NextResponse.redirect(
      new URL('/login?message=Invalid+OAuth+response', request.url),
    )
  }

  // ── Verify HMAC-signed state (CSRF protection + origin extraction) ─────────
  const stateData = verifyToken<OAuthState>(stateParam, ':oauth-state', 600)
  if (!stateData) {
    return NextResponse.redirect(
      new URL('/login?message=Invalid+or+expired+OAuth+state.+Please+try+again.', request.url),
    )
  }

  // ── Parse origin for redirects ────────────────────────────────────────────
  let originUrl: URL
  try {
    originUrl = new URL(stateData.origin)
  } catch {
    return NextResponse.redirect(
      new URL('/login?message=Invalid+OAuth+origin', request.url),
    )
  }

  const originBase = stateData.origin // e.g. "https://digital.gcet.edu.in"
  const originHostname = originUrl.host // e.g. "digital.gcet.edu.in" or "localhost:3000"

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID!
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET!
    const redirectUri =
      process.env.GOOGLE_REDIRECT_URI ?? `${getBaseUrl(request)}/api/auth/google/callback`

    // ── Exchange authorisation code for tokens ────────────────────────────
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
        new URL(`/login?message=${encodeURIComponent('Failed to authenticate with Google')}`, originBase),
      )
    }

    const tokens: GoogleTokenResponse = await tokenResponse.json()

    // ── Fetch Google profile ──────────────────────────────────────────────
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })

    if (!userInfoResponse.ok) {
      return NextResponse.redirect(
        new URL(`/login?message=${encodeURIComponent('Failed to get Google user info')}`, originBase),
      )
    }

    const googleUser: GoogleUserInfo = await userInfoResponse.json()

    if (!googleUser.email_verified) {
      return NextResponse.redirect(
        new URL(`/login?message=${encodeURIComponent('Google email is not verified')}`, originBase),
      )
    }

    const payload = await getPayload({ config })

    // ── Resolve institution from origin domain ────────────────────────────
    const resolvedTenant = await resolveTenant(originHostname, payload)
    if (!resolvedTenant) {
      return NextResponse.redirect(
        new URL(`/login?message=${encodeURIComponent('Institution not found for this domain')}`, originBase),
      )
    }

    // ── Find existing user by email ───────────────────────────────────────
    const existingUsers = await payload.find({
      collection: 'users',
      where: { email: { equals: googleUser.email } },
      limit: 1,
      overrideAccess: true,
    })

    const tempPassword = generateSecurePassword()
    let user: User
    let savedHash: string | null = null
    let savedSalt: string | null = null
    let isNewUser = false

    if (existingUsers.docs.length > 0) {
      // ── Existing user ──────────────────────────────────────────────────
      user = existingUsers.docs[0]!
      const isSuperAdmin = user.role === 'superadmin'

      // Institution scope check — block cross-institution login
      if (!isSuperAdmin) {
        const userInstitutionId =
          typeof user.institution === 'string'
            ? user.institution
            : (user.institution as Institution | null)?.id ?? null

        if (!userInstitutionId) {
          return NextResponse.redirect(
            new URL(
              `/login?message=${encodeURIComponent('Your account is not associated with any institution. Please contact support.')}`,
              originBase,
            ),
          )
        }

        if (userInstitutionId !== resolvedTenant.institutionId) {
          // Look up the correct institution to show a useful error
          try {
            const correctInst = (await payload.findByID({
              collection: 'institutions',
              id: userInstitutionId,
              depth: 0,
            })) as Institution
            const mainHostname = correctInst.domains?.find((d) => d.purpose === 'main')?.hostname
            const institutionName = correctInst.shortName || correctInst.name
            const msg = mainHostname
              ? `This account belongs to ${institutionName}. Please sign in at ${mainHostname}/login`
              : `This account belongs to ${institutionName}. Please use the correct institution login page.`
            return NextResponse.redirect(
              new URL(`/login?message=${encodeURIComponent(msg)}`, originBase),
            )
          } catch {
            return NextResponse.redirect(
              new URL(
                `/login?message=${encodeURIComponent('Your account does not belong to this institution.')}`,
                originBase,
              ),
            )
          }
        }
      }

      // Save original hash+salt so we can restore them after temp-password login
      const db = (
        payload.db as unknown as {
          connection: {
            db: {
              collection: (n: string) => {
                findOne: (q: Record<string, unknown>) => Promise<Record<string, unknown> | null>
              }
            }
          }
        }
      ).connection?.db
      if (db) {
        const rawUser = await db.collection('users').findOne({ email: googleUser.email })
        if (rawUser) {
          savedHash = (rawUser.hash as string) ?? null
          savedSalt = (rawUser.salt as string) ?? null
        }
      }

      // Set temp password and upgrade authProvider
      const currentProvider = (user as unknown as Record<string, unknown>).authProvider as
        | string
        | undefined
      const updateData: Record<string, unknown> = {
        password: tempPassword,
        googleSubId: googleUser.sub,
      }
      if (!currentProvider || currentProvider === 'local') {
        updateData.authProvider = 'both'
      }

      await payload.update({
        collection: 'users',
        id: user.id,
        data: updateData,
        overrideAccess: true,
      })
    } else {
      // ── New user — assign institution from origin domain ───────────────
      user = await payload.create({
        collection: 'users',
        data: {
          name: googleUser.name,
          email: googleUser.email,
          password: tempPassword,
          role: 'user',
          bio: '',
          authProvider: 'google',
          googleSubId: googleUser.sub,
          institution: resolvedTenant.institutionId,
        },
        overrideAccess: true,
      })
      isNewUser = true
    }

    // ── Log in via Payload to get a valid JWT ─────────────────────────────
    const loginResult = await payload.login({
      collection: 'users',
      data: { email: googleUser.email, password: tempPassword },
    })

    const token = loginResult?.token

    // ── Restore original password hash for existing users ─────────────────
    if (savedHash && savedSalt) {
      const db = (
        payload.db as unknown as {
          connection: {
            db: {
              collection: (n: string) => {
                updateOne: (
                  q: Record<string, unknown>,
                  u: Record<string, unknown>,
                ) => Promise<unknown>
              }
            }
          }
        }
      ).connection?.db
      if (db) {
        await db.collection('users').updateOne(
          { email: googleUser.email },
          { $set: { hash: savedHash, salt: savedSalt } },
        )
      }
    }

    if (!token) {
      return NextResponse.redirect(
        new URL(`/login?message=${encodeURIComponent('Failed to generate session token')}`, originBase),
      )
    }

    // ── Determine post-login redirect path ────────────────────────────────
    let redirectPath: string
    if (isNewUser) {
      redirectPath = '/set-password'
    } else if (stateData.redirectTo && stateData.redirectTo.startsWith('/')) {
      redirectPath = stateData.redirectTo
    } else {
      const u = loginResult.user as { role?: string; roleAssignments?: Array<unknown> }
      if (u.role === 'superadmin') {
        redirectPath = '/platform'
      } else {
        redirectPath =
          Array.isArray(u.roleAssignments) && u.roleAssignments.length > 0 ? '/user' : '/'
      }
    }

    // ── Build finalize ticket (short-lived, 60s) ──────────────────────────
    const ticketPayload: FinalizeTicket = {
      payloadToken: token,
      redirectPath,
      iat: Math.floor(Date.now() / 1000),
    }
    const ticket = signToken(ticketPayload, ':finalize')

    // Redirect to institution domain's finalize route to set the cookie
    return NextResponse.redirect(
      new URL(`/api/auth/google/finalize?ticket=${encodeURIComponent(ticket)}`, originBase),
    )
  } catch (error) {
    console.error('Google OAuth callback error:', error)
    return NextResponse.redirect(
      new URL(
        `/login?message=${encodeURIComponent('An error occurred during Google sign-in')}`,
        originBase,
      ),
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
