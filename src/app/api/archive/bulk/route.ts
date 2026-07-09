import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

import { archiveComment, archivePost, getArchiveConfig } from '@backend/archive/service'
import { canManageArchive, parseBulkBody, runBulk } from '../bulk-utils'

export async function POST(request: NextRequest) {
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: request.headers })
  if (!user) return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 })
  if (!canManageArchive(user)) {
    return NextResponse.json({ success: false, message: 'Editor or Admin role required' }, { status: 403 })
  }

  const parsed = parseBulkBody(await request.json(), 'ids')
  if ('error' in parsed) return NextResponse.json({ success: false, message: parsed.error }, { status: 400 })
  const config = await getArchiveConfig(payload)
  const result = await runBulk(parsed.ids, (id) =>
    parsed.type === 'posts'
      ? archivePost({ payload, postId: id, user, retentionDays: config.postArchiveRetentionDays })
      : archiveComment({ payload, commentId: id, user }),
  )

  revalidatePath('/editor/queue')
  revalidatePath('/contributor/drafts')
  revalidatePath('/contributor/submissions')
  return NextResponse.json({
    success: result.failed.length === 0,
    message: `${result.succeeded.length} archived, ${result.failed.length} failed`,
    ...result,
  })
}
