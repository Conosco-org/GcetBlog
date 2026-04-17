import { getPayload } from 'payload'
import config from '../payload.config'

let payloadInstance: Awaited<ReturnType<typeof getPayload>> | null = null

/**
 * Singleton getter for Payload instance.
 * Use this everywhere instead of calling getPayload({ config }) inline.
 */
export async function getPayloadClient() {
  if (!payloadInstance) {
    payloadInstance = await getPayload({ config })
  }
  return payloadInstance
}
