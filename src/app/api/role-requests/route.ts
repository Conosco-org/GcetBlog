import { getPayload } from 'payload'
import config from '@payload-config'
import { getCurrentUser } from '../../(auth)/login/actions'

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config })

    const requests = await payload.find({
      collection: 'role-upgrade-requests',
      where: {
        user: {
          equals: user.id,
        },
      },
      sort: '-createdAt',
    })

    return Response.json(requests.docs)
  } catch (error) {
    console.error('Error fetching role requests:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'contributor') {
      return Response.json(
        { error: 'Only contributors can request role upgrades' },
        { status: 403 },
      )
    }

    const body = await request.json()
    const { requestedRole, reason } = body

    if (!requestedRole || !reason) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!['editor', 'admin'].includes(requestedRole)) {
      return Response.json({ error: 'Invalid requested role' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    // Check if user already has a pending request
    const existingRequest = await payload.find({
      collection: 'role-upgrade-requests',
      where: {
        and: [
          {
            user: {
              equals: user.id,
            },
          },
          {
            status: {
              equals: 'pending',
            },
          },
        ],
      },
    })

    if (existingRequest.docs.length > 0) {
      return Response.json({ error: 'You already have a pending request' }, { status: 400 })
    }

    // Create new request
    const newRequest = await payload.create({
      collection: 'role-upgrade-requests',
      data: {
        user: user.id,
        requestedRole,
        message: reason,
        status: 'pending',
      },
    })

    return Response.json(newRequest)
  } catch (error) {
    console.error('Error creating role request:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
