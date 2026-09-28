import { getPayload } from 'payload'
import config from '../backend/payload.config'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { getFieldsToSign, jwtSign } from 'payload'

async function run() {
  const payload = await getPayload({ config })
  
  console.log('Connected to payload.')
  
  // Create or get user
  const email = 'test-oauth-comparison@gcet.edu.in'
  let user = await payload.find({
    collection: 'users',
    where: { email: { equals: email } },
    limit: 1,
  }).then(r => r.docs[0])

  if (!user) {
    user = await payload.create({
      collection: 'users',
      data: {
        name: 'Test OAuth',
        email,
        password: 'password123!',
        role: 'contributor',
      }
    })
  }
  
  // NATIVE LOGIN
  const nativeResult = await payload.login({
    collection: 'users',
    data: { email, password: 'password123!' },
  })
  const nativeToken = nativeResult.token
  const decodedNative = jwt.decode(nativeToken)
  
  // Re-fetch user to see the session that native login created
  const userAfterNative = await payload.findByID({ collection: 'users', id: user.id })
  console.log('--- NATIVE LOGIN ---')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  console.log('JWT sid:', (decodedNative as any).sid)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  console.log('Sessions in DB:', userAfterNative.sessions?.map((s: any) => s.id))
  
  // OAUTH LOGIN
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
  const activeSessions = (userAfterNative.sessions || []).filter((s: any) => {
    const expiry = s.expiresAt instanceof Date ? s.expiresAt : new Date(s.expiresAt)
    return expiry > now
  })

  const updatedUserForOauth = { ...userAfterNative, sessions: [...activeSessions, oauthSession], updatedAt: null }

  await payload.db.updateOne({
    collection: 'users',
    id: user.id,
    data: updatedUserForOauth,
  })
  
  updatedUserForOauth.collection = 'users'
  updatedUserForOauth._strategy = 'local-jwt'

  const fieldsToSign = getFieldsToSign({
    collectionConfig,
    email: updatedUserForOauth.email,
    sid,
    user: updatedUserForOauth,
  })

  const { token: oauthToken } = await jwtSign({
    fieldsToSign,
    secret: process.env.PAYLOAD_SECRET!,
    tokenExpiration,
  })

  const decodedOauth = jwt.decode(oauthToken)
  
  // Re-fetch user to see the session that OAuth login created
  const userAfterOauth = await payload.findByID({ collection: 'users', id: user.id })
  
  console.log('--- OAUTH LOGIN ---')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  console.log('JWT sid:', (decodedOauth as any).sid)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  console.log('Sessions in DB:', userAfterOauth.sessions?.map((s: any) => s.id))

  console.log('--- DB SESSION VALIDATION ---')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  console.log('Is OAuth JWT sid in DB?', userAfterOauth.sessions?.some((s: any) => s.id === (decodedOauth as any).sid))
  
  console.log('--- SECRETS ---')
  console.log('process.env.PAYLOAD_SECRET:', process.env.PAYLOAD_SECRET?.substring(0, 8))
  console.log('payload.secret:', payload.secret?.substring(0, 8))
  
  process.exit(0)
}

run().catch(console.error)
