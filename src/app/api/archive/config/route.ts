import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

import { normalizeArchiveConfig } from '@backend/archive/service'
import { validateArchiveConfigBody } from '@backend/archive/config-validation'

const isAdminUser = (user: unknown): user is { id: string; role?: string; isAdmin?: boolean } => {
  const typedUser = user as { role?: string; isAdmin?: boolean } | undefined
  return typedUser?.role === 'admin' || typedUser?.isAdmin === true
}

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers: request.headers })
    if (!user) return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 })
    if (!isAdminUser(user)) {
      return NextResponse.json({ success: false, message: 'Access denied: Admin role required' }, { status: 403 })
    }

    const archiveConfig = await payload.findGlobal({
      slug: 'archive-config',
      depth: 0,
      overrideAccess: true,
    })
    return NextResponse.json({ success: true, config: normalizeArchiveConfig(archiveConfig) })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to load archive config' },
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

    const validation = validateArchiveConfigBody(await request.json())
    if ('error' in validation) {
      return NextResponse.json({ success: false, message: validation.error }, { status: 400 })
    }
    const archiveConfig = await payload.updateGlobal({
      slug: 'archive-config',
      data: validation.data,
      overrideAccess: true,
    })
    return NextResponse.json({ success: true, config: archiveConfig, message: 'Archive settings saved' })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to save archive config' },
      { status: 500 },
    )
  }
}
