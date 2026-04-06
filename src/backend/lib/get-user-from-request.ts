import type { NextRequest } from 'next/server'
import { getPayloadClient } from './payload-client'

/**
 * Extracts and validates the current user from a request.
 * Used in API routes for authentication.
 */
export async function getUserFromRequest(request: NextRequest) {
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: request.headers })
  return user
}
