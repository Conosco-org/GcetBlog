import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getFieldsToSign, jwtSign } from 'payload'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'

export async function GET() {
  try {
    const payload = await getPayload({ config })
    const email = 'test-auth-comparison@gcet.edu.in'
    const password = 'test-password-1234!'

    let user = await payload.find({
      collection: 'users',
      where: { email: { equals: email } },
      limit: 1,
    }).then(res => res.docs[0])

    if (!user) {
      user = await payload.create({
        collection: 'users',
        data: {
          name: 'Test User',
          email,
          password,
          role: 'contributor',
        }
      })
    }

    // NATIVE LOGIN
    const nativeLoginResult = await payload.login({
      collection: 'users',
      data: { email, password },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      req: { payload } as any, // Mock enough req
    })
    const nativeToken = nativeLoginResult.token
    const decodedNative = jwt.decode(nativeToken!, { complete: true })

    // OAUTH LOGIN
    // Replicate oauth-session logic without cookies()
    const collectionConfig = payload.collections['users'].config
    const tokenExpiration = collectionConfig.auth?.tokenExpiration || 7200
    const sid = crypto.randomUUID()
    const now = new Date()
    const expiresAt = new Date(now.getTime() + tokenExpiration * 1000)

    const oauthSession = {
      id: sid,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const activeSessions = (user.sessions || []).filter((s: any) => {
      const expiry = s.expiresAt instanceof Date ? s.expiresAt : new Date(s.expiresAt)
      return expiry > now
    })

    const updatedUserForOauth = { ...user, sessions: [...activeSessions, oauthSession], updatedAt: null }

    await payload.db.updateOne({
      collection: 'users',
      id: user.id,
      data: updatedUserForOauth,
    });
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (updatedUserForOauth as any).collection = 'users';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (updatedUserForOauth as any)._strategy = 'local-jwt';

    const fieldsToSign = getFieldsToSign({
      collectionConfig,
      email: updatedUserForOauth.email,
      sid,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      user: updatedUserForOauth as any,
    })

    const { token: oauthToken } = await jwtSign({
      fieldsToSign,
      secret: process.env.PAYLOAD_SECRET!,
      tokenExpiration,
    })

    const decodedOauth = jwt.decode(oauthToken, { complete: true })

    return NextResponse.json({
      native: decodedNative,
      oauth: decodedOauth,
      fieldsToSignKeys: Object.keys(fieldsToSign)
    })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ error: error.message, stack: error.stack })
  }
}
