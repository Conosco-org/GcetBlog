import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { revalidatePath } from 'next/cache'
import configPromise from '@payload-config'

import { archivePost } from '@backend/lifecycle/service'

const canManageLifecycle = (user: unknown): user is { id: string; role?: string } => {
  const role = (user as { role?: string } | undefined)?.role
  return role === 'editor' || role === 'admin'
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers: request.headers })

    if (!user) return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 })
    if (!canManageLifecycle(user)) {
      return NextResponse.json({ success: false, message: 'Access denied: Admin or Editor role required' }, { status: 403 })
    }

    const body = await request.json()
    const postId = typeof body?.postId === 'string' ? body.postId : ''
    if (!postId) return NextResponse.json({ success: false, message: 'postId is required' }, { status: 400 })

    await archivePost({
      payload,
      postId,
      user,
      reason: 'manual',
    })

    revalidatePath('/editor/queue')
    revalidatePath('/editor/lifecycle')
    revalidatePath('/contributor/drafts')
    revalidatePath('/contributor/submissions')

    return NextResponse.json({ success: true, message: 'Post archived successfully' })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to archive post',
      },
      { status: 500 },
    )
  }
}
