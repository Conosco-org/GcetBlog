import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/utilities/getUserFromRequest'
import { getPayloadClient } from '@/utilities/getPayloadClient'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const payload = await getPayloadClient()

  const notification = await payload.findByID({
    collection: 'notifications',
    id,
    overrideAccess: true,
  })

  if (!notification) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const recipientId = typeof notification.recipient === 'string'
    ? notification.recipient
    : notification.recipient?.id

  const u = user as { role?: string; id?: string }
  if (recipientId !== u.id && u.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await payload.update({
    collection: 'notifications',
    id,
    data: { isRead: true, readAt: new Date().toISOString() },
    overrideAccess: true,
  })

  return NextResponse.json({ success: true })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const payload = await getPayloadClient()

  const notification = await payload.findByID({
    collection: 'notifications',
    id,
    overrideAccess: true,
  })

  if (!notification) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const recipientId = typeof notification.recipient === 'string'
    ? notification.recipient
    : notification.recipient?.id

  const u = user as { role?: string; id?: string }
  if (recipientId !== u.id && u.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await payload.delete({ collection: 'notifications', id, overrideAccess: true })

  return NextResponse.json({ success: true })
}
