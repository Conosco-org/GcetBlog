import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * POST /api/auth/set-password
 *
 * Allows a Google-only user to set a password so they can also log in
 * with email/password. Requires a valid `payload-token` cookie (the user
 * must already be logged in via Google).
 *
 * Body: { password: string }
 *
 * On success, sets authProvider to 'both' and returns the redirect path.
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })

    // Verify the user is logged in
    const { user } = await payload.auth({ headers: request.headers })
    if (!user) {
      return Response.json(
        { success: false, message: 'Not authenticated. Please sign in again.' },
        { status: 401 },
      )
    }

    const body = await request.json()
    const { password } = body as { password?: string }

    if (!password || typeof password !== 'string') {
      return Response.json(
        { success: false, message: 'Password is required.' },
        { status: 400 },
      )
    }

    if (password.length < 8) {
      return Response.json(
        { success: false, message: 'Password must be at least 8 characters.' },
        { status: 400 },
      )
    }

    // Update the user's password and set authProvider to 'both'
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        password,
        authProvider: 'both',
      },
      overrideAccess: true,
    })

    // Determine redirect path
    const typedUser = user as unknown as { isAdmin?: boolean; role?: string }
    const redirectPath = typedUser?.isAdmin
      ? '/admin-dashboard'
      : typedUser?.role === 'editor'
        ? '/editor'
        : '/contributor'

    return Response.json({ success: true, redirectPath })
  } catch (error) {
    console.error('Set password error:', error)
    return Response.json(
      { success: false, message: 'An error occurred. Please try again.' },
      { status: 500 },
    )
  }
}
