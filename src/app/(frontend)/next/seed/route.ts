import { createLocalReq, getPayload } from 'payload'
import { seed } from '@backend/endpoints/seed'
import config from '@payload-config'
import { headers } from 'next/headers'

export const maxDuration = 60 // This function can run for a maximum of 60 seconds

export async function POST(): Promise<Response> {
  const payload = await getPayload({ config })
  const requestHeaders = await headers()

  // Authenticate by passing request headers
  const { user } = await payload.auth({ headers: requestHeaders })

  // Check if there are any users in the system
  const userCount = await payload.count({
    collection: 'users',
  })

  // Allow seeding if no users exist OR if user is authenticated
  if (!user && userCount.totalDocs > 0) {
    return new Response('Action forbidden. Please login as admin to seed the database.', { status: 403 })
  }

  try {
    // Create a Payload request object to pass to the Local API for transactions
    // If no user exists, create a temporary admin context for seeding
    const payloadReq = user 
      ? await createLocalReq({ user }, payload)
      : await createLocalReq({}, payload)

    await seed({ payload, req: payloadReq })

    return Response.json({ success: true, message: 'Database seeded successfully!' })
  } catch (e) {
    payload.logger.error({ err: e, message: 'Error seeding data' })
    return new Response('Error seeding data.', { status: 500 })
  }
}
