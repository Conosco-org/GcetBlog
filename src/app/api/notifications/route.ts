import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@backend/lib/get-user-from-request'
import { getPayloadClient } from '@backend/lib/payload-client'

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const payload = await getPayloadClient()
  const notifications = await payload.find({
    collection: 'notifications',
    where: { recipient: { equals: user.id } },
    sort: '-createdAt',
    limit: 20,
    overrideAccess: true,
  })

  const unreadCount = notifications.docs.filter(n => !n.isRead).length

  return NextResponse.json(
    { ...notifications, unreadCount },
    { headers: { 'X-Unread-Count': String(unreadCount) } }
  )
}
