import { BasePayload, getFieldsToSign, jwtSign } from 'payload'
import { cookies } from 'next/headers'
import crypto from 'crypto'

interface CreateOAuthSessionArgs {
  payload: BasePayload
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any
}

/**
 * Safely creates a persistent Payload CMS session for an OAuth user.
 * This completely bypasses the need for knowing or mutating the user's password.
 */
export async function createPayloadOAuthSession({
  payload,
  user,
}: CreateOAuthSessionArgs) {
  const collectionConfig = payload.collections['users'].config
  
  if (!collectionConfig.auth) {
    throw new Error('Users collection is not auth-enabled')
  }

  const tokenExpiration = collectionConfig.auth.tokenExpiration || 7200
  const useSessions = collectionConfig.auth.useSessions !== false

  let sid: string | undefined

  // 1. Manually manage the session in MongoDB if useSessions is true
  if (useSessions) {
    sid = crypto.randomUUID()
    const now = new Date()
    const expiresAt = new Date(now.getTime() + tokenExpiration * 1000)

    const session = {
      id: sid,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    }

    // Filter out expired sessions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const activeSessions = (user.sessions || []).filter((s: any) => {
      const expiry = s.expiresAt instanceof Date ? s.expiresAt : new Date(s.expiresAt)
      return expiry > now
    })

    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        sessions: [...activeSessions, session],
      },
      overrideAccess: true,
    })
  }

  // 2. Generate fields to sign (id, collection, email, sid, and anything with saveToJWT)
  const fieldsToSign = getFieldsToSign({
    collectionConfig,
    email: user.email,
    sid,
    user,
  })

  // 3. Mint the JWT
  const { token } = await jwtSign({
    fieldsToSign,
    secret: process.env.PAYLOAD_SECRET!,
    tokenExpiration,
  })

  // 4. Set the standard Payload auth cookie
  const cookiePrefix = payload.config.cookiePrefix || 'payload'
  const cookieName = `${cookiePrefix}-token`
  const cookieStore = await cookies()
  
  cookieStore.set(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: tokenExpiration, // maxAge takes seconds
  })

  return { token, cookieName }
}
