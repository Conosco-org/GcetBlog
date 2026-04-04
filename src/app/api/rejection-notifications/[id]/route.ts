import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const payload = await getPayload({ config: configPromise })

    // Authenticate the request
    const { user } = await payload.auth({ headers: request.headers })

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the notification to verify ownership
    const notification = await payload.findByID({
      collection: 'rejection-notifications',
      id,
    })

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
    }

    // Check if user is the contributor or an editor/admin
    const userRole = (user as { role: string }).role
    const contributorId = typeof notification.contributor === 'string' 
      ? notification.contributor 
      : notification.contributor?.id

    if (userRole !== 'editor' && userRole !== 'admin' && user.id !== contributorId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete the notification
    await payload.delete({
      collection: 'rejection-notifications',
      id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting rejection notification:', error)
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    )
  }
}
