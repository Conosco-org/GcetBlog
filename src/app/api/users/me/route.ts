import { getPayload } from 'payload'
import config from '@payload-config'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const { user } = await payload.auth({ headers: request.headers })

    if (!user) {
      return Response.json({ error: 'Unauthorized', sessionExpired: true }, { status: 401 })
    }

    return Response.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Error in /api/users/me:', error)
    
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
