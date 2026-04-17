import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@backend/lib/get-user-from-request'
import { getPayloadClient } from '@backend/lib/payload-client'

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const payload = await getPayloadClient()
  const u = user as { id?: string }

  const unread = await payload.find({
    collection: 'notifications',
    where: {
      and: [
        { recipient: { equals: u.id } },
        { isRead: { equals: false } },
      ],
    },
    limit: 100,
    overrideAccess: true,
  })

  await Promise.all(
    unread.docs.map(n =>
      payload.update({
        collection: 'notifications',
        id: n.id,
        data: { isRead: true, readAt: new Date().toISOString() },
        overrideAccess: true,
      })
    )
  )

  return NextResponse.json({ success: true, count: unread.docs.length })
}
