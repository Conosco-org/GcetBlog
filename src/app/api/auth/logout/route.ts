import { logoutWithoutRedirect } from '../../../(frontend)/login/actions'

export async function POST() {
  try {
    await logoutWithoutRedirect()
    return Response.json({ success: true })
  } catch (error) {
    console.error('Error in logout API:', error)
    return Response.json({ error: 'Failed to logout' }, { status: 500 })
  }
}
