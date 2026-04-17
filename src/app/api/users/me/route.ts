import { getPayload } from 'payload'
import config from '@payload-config'
import { NextRequest } from 'next/server'
import { User } from '@shared/types/payload-types'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const { user } = await payload.auth({ headers: request.headers })

    if (!user) {
      return Response.json({ error: 'Unauthorized', sessionExpired: true }, { status: 401 })
    }

    // Type assertion to access custom fields
    const typedUser = user as User

    return Response.json({
      user: {
        id: typedUser.id,
        email: typedUser.email,
        name: typedUser.name,
        role: typedUser.role,
        isAdmin: typedUser.isAdmin,
        canManageAdmins: typedUser.canManageAdmins,
      },
    })
  } catch (error) {
    // Check if error is related to token expiration
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase()
      if (errorMessage.includes('token') || errorMessage.includes('expired') || errorMessage.includes('invalid')) {
        return Response.json({ 
          error: 'Session expired', 
          sessionExpired: true 
        }, { status: 401 })
      }
    }
    
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
