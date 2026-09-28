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
      createdAt: now,
      expiresAt: expiresAt,
    }

    // Filter out expired sessions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const activeSessions = (user.sessions || []).filter((s: any) => {
      const expiry = s.expiresAt instanceof Date ? s.expiresAt : new Date(s.expiresAt)
      return expiry > now
    })

    user.sessions = [...activeSessions, session]
    user.updatedAt = null // Prevent updatedAt from being updated when only adding a session

    console.log('[OAuthSession] creating session', {
      userId: user.id,
      sidPrefix: sid?.slice(0, 8),
      createdAtType: typeof session.createdAt,
      createdAtIsDate: session.createdAt instanceof Date,
      createdAt: (session.createdAt as Date).toISOString(),
      expiresAtType: typeof session.expiresAt,
      expiresAtIsDate: session.expiresAt instanceof Date,
      expiresAt: (session.expiresAt as Date).toISOString(),
      previousSessionCount: user.sessions?.length || 0,
      activeSessionCount: activeSessions.length,
      tokenExpiration,
    })

    // Use db.updateOne directly to avoid triggering collection hooks on login
    try {
      const updateResult = await payload.db.updateOne({
        collection: 'users',
        id: user.id,
        data: user,
      })
      console.log('[OAuthSession] session write complete', {
        userId: user.id,
        sidPrefix: sid?.slice(0, 8),
        success: !!updateResult,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        returnedId: (updateResult as any)?.id
      })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      console.log('[OAuthSession] session write failed', {
        name: e?.name,
        message: e?.message,
        userId: user.id,
        sidPrefix: sid?.slice(0, 8)
      })
      throw e
    }

    const postWriteUser = await payload.findByID({
      collection: 'users',
      id: user.id,
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const matchingSession = postWriteUser?.sessions?.find((s: any) => s.id === sid)
    console.log('[OAuthSession] post-write verification', {
      userId: user.id,
      sessionCount: postWriteUser?.sessions?.length || 0,
      sessionExists: !!matchingSession,
      matchingSessionCreatedAtType: matchingSession ? typeof matchingSession.createdAt : null,
      matchingSessionCreatedAtValue: matchingSession?.createdAt,
      matchingSessionExpiresAtType: matchingSession ? typeof matchingSession.expiresAt : null,
      matchingSessionExpiresAtValue: matchingSession?.expiresAt,
    })
    
    user.collection = 'users'
    user._strategy = 'local-jwt'
  }

  // 2. Generate fields to sign using the UPDATED user
  const fieldsToSign = getFieldsToSign({
    collectionConfig,
    email: user.email,
    sid,
    user,
  })
  
  console.log('[OAuthSession] jwt metadata', {
    userId: user.id,
    sidPrefix: sid?.slice(0, 8),
    fieldsToSignKeys: Object.keys(fieldsToSign),
    hasSid: 'sid' in fieldsToSign || '_sid' in fieldsToSign,
    collection: fieldsToSign.collection,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    strategy: (fieldsToSign as any)._strategy,
    hasAuthVersion: 'authVersion' in fieldsToSign,
    tokenExpiration,
  })

  // 3. Mint the JWT
  const { token } = await jwtSign({
    fieldsToSign,
    secret: payload.secret,
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

  console.log('[OAuthSession] cookie set', {
    cookieName,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    httpOnly: true,
    maxAge: tokenExpiration,
    tokenPresent: !!token,
  })

  return { token, cookieName }
}
