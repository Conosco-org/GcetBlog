import { getCurrentUser } from '../../../(frontend)/login/actions'

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
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
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
