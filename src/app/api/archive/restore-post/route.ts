import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { revalidatePath } from 'next/cache'
import configPromise from '@payload-config'

import { restoreArchivedPost } from '@backend/archive/service'

const canManageArchive = (user: unknown): user is { id: string; role?: string; isAdmin?: boolean } => {
  const typedUser = user as { role?: string; isAdmin?: boolean } | undefined
  return typedUser?.role === 'editor' || typedUser?.role === 'admin' || typedUser?.isAdmin === true
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers: request.headers })

    if (!user) return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 })
    if (!canManageArchive(user)) {
      return NextResponse.json({ success: false, message: 'Access denied: Admin or Editor role required' }, { status: 403 })
    }

    const body = await request.json()
    const archiveId = typeof body?.archiveId === 'string' ? body.archiveId : ''
    if (!archiveId) return NextResponse.json({ success: false, message: 'archiveId is required' }, { status: 400 })

    await restoreArchivedPost({
      payload,
      archiveId,
      user,
    })

    revalidatePath('/editor/queue')
    revalidatePath('/editor/archive')
    revalidatePath('/contributor/drafts')
    revalidatePath('/contributor/submissions')

    return NextResponse.json({ success: true, message: 'Post restored to review queue' })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to restore post',
      },
      { status: 500 },
    )
  }
}
