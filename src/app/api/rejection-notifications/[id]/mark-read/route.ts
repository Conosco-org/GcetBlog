import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const payload = await getPayload({ config: configPromise })
    const requestHeaders = await headers()

    // Authenticate the request
    const { user } = await payload.auth({ headers: requestHeaders })

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Update the notification to mark as read
    await payload.update({
      collection: 'rejection-notifications',
      id,
      data: {
        isRead: true,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking rejection as read:', error)
    return NextResponse.json(
      { error: 'Failed to mark rejection as read' },
      { status: 500 }
    )
  }
}
