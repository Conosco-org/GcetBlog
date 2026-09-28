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
  const decodedNative = jwt.decode(nativeToken!, { complete: true })
  
  // OAUTH LOGIN
  const collectionConfig = payload.collections['users'].config
  const tokenExpiration = collectionConfig.auth?.tokenExpiration || 7200
  const sid = crypto.randomUUID()
  const now = new Date()
  const expiresAt = new Date(now.getTime() + tokenExpiration * 1000)

  const oauthSession = {
    id: sid,
    createdAt: now,
    expiresAt: expiresAt,
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
  })
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(updatedUserForOauth as any).collection = 'users'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(updatedUserForOauth as any)._strategy = 'local-jwt'

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
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const extractMetadata = (decoded: any) => ({
    headerKeys: Object.keys(decoded.header),
    alg: decoded.header.alg,
    claimNames: Object.keys(decoded.payload),
    id: decoded.payload.id,
    collection: decoded.payload.collection,
    sidPresent: 'sid' in decoded.payload,
    _sidPresent: '_sid' in decoded.payload,
    _strategyPresent: '_strategy' in decoded.payload,
    _strategyValue: decoded.payload._strategy,
    authVersionPresent: 'authVersion' in decoded.payload,
    authVersionValue: decoded.payload.authVersion,
    iat: decoded.payload.iat,
    exp: decoded.payload.exp,
    lifetime: decoded.payload.exp - decoded.payload.iat,
  });

  console.log('--- NATIVE JWT METADATA ---')
  console.log(JSON.stringify(extractMetadata(decodedNative), null, 2))

  console.log('--- OAUTH JWT METADATA ---')
  console.log(JSON.stringify(extractMetadata(decodedOauth), null, 2))
  
  console.log('--- SECRETS AND ALGORITHM COMPARISON ---')
  console.log('process.env.PAYLOAD_SECRET fingerprint:', process.env.PAYLOAD_SECRET?.substring(0, 8))
  console.log('payload.secret fingerprint:', payload.secret?.substring(0, 8))
  
  process.exit(0)
}

run().catch(console.error)
