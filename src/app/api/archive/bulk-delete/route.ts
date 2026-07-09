import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

import { deleteArchivedComment, deleteArchivedPost } from '@backend/archive/service'
import { canManageArchive, parseBulkBody, runBulk } from '../bulk-utils'

export async function DELETE(request: NextRequest) {
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: request.headers })
  if (!user) return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 })
  if (!canManageArchive(user)) {
    return NextResponse.json({ success: false, message: 'Editor or Admin role required' }, { status: 403 })
  }

  const parsed = parseBulkBody(await request.json(), 'archiveIds')
  if ('error' in parsed) return NextResponse.json({ success: false, message: parsed.error }, { status: 400 })
  const result = await runBulk(parsed.ids, (id) =>
    parsed.type === 'posts'
      ? deleteArchivedPost({ payload, archiveId: id, user })
      : deleteArchivedComment({ payload, archiveId: id, user }),
  )

  revalidatePath('/editor/queue')
  return NextResponse.json({
    success: result.failed.length === 0,
    message: `${result.succeeded.length} permanently deleted, ${result.failed.length} failed`,
    ...result,
  })
}
