import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

const thresholdValues = ['15-days', '30-days', '60-days', '90-days'] as const
const scheduleValues = ['hourly', 'daily', 'weekly', 'monthly'] as const

type PostArchiveThreshold = (typeof thresholdValues)[number]
type JobSchedule = (typeof scheduleValues)[number]

const thresholdSet = new Set<string>(thresholdValues)
const scheduleSet = new Set<string>(scheduleValues)

const isAdminUser = (user: unknown): user is { id: string; role?: string } => {
  return (user as { role?: string } | undefined)?.role === 'admin'
}

function validateConfigBody(body: unknown) {
  const data = body as Record<string, unknown>
  const commentDeletionThreshold = Number(data.commentDeletionThreshold)
  const postArchiveThreshold = String(data.postArchiveThreshold || '')
  const jobSchedule = String(data.jobSchedule || '')

  if (!Number.isInteger(commentDeletionThreshold) || commentDeletionThreshold < 1 || commentDeletionThreshold > 3650) {
    return { error: 'Comment deletion threshold must be between 1 and 3650 days' }
  }
  if (!thresholdSet.has(postArchiveThreshold)) {
    return { error: 'Post archive threshold must be one of: 15 days, 30 days, 60 days, 90 days' }
  }
  if (!scheduleSet.has(jobSchedule)) {
    return { error: 'Job schedule must be one of: hourly, daily, weekly, monthly' }
  }

  return {
    data: {
      commentDeletionThreshold,
      postArchiveThreshold: postArchiveThreshold as PostArchiveThreshold,
      autoArchiveEnabled: Boolean(data.autoArchiveEnabled),
      jobSchedule: jobSchedule as JobSchedule,
      dryRunEnabled: Boolean(data.dryRunEnabled),
    },
  }
}

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers: request.headers })

    if (!user) return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 })
    if (!isAdminUser(user)) {
      return NextResponse.json({ success: false, message: 'Access denied: Admin role required' }, { status: 403 })
    }

    const lifecycleConfig = await payload.findGlobal({
      slug: 'lifecycle-config',
      depth: 0,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true, config: lifecycleConfig })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to load lifecycle config',
      },
      { status: 500 },
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers: request.headers })

    if (!user) return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 })
    if (!isAdminUser(user)) {
      return NextResponse.json({ success: false, message: 'Access denied: Admin role required' }, { status: 403 })
    }

    const validation = validateConfigBody(await request.json())
    if ('error' in validation) {
      return NextResponse.json({ success: false, message: validation.error }, { status: 400 })
    }

    const lifecycleConfig = await payload.updateGlobal({
      slug: 'lifecycle-config',
      data: validation.data,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true, config: lifecycleConfig, message: 'Lifecycle config saved' })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to save lifecycle config',
      },
      { status: 500 },
    )
  }
}
