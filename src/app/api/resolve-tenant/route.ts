/**
 * Tenant Resolution API — Multi-Tenant Architecture (v3)
 *
 * GET /api/resolve-tenant?hostname=blog.gcet.edu.in
 *
 * Called by Edge middleware to resolve hostname → institution.
 * Returns { institutionId, code, status, clubScope? } or 404.
 *
 * This endpoint runs in Node.js runtime (not Edge) so it can use Payload.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import {
  resolveTenant,
  clearTenantCache,
} from '@/utilities/tenantResolver'

export async function GET(request: NextRequest) {
  const hostname = request.nextUrl.searchParams.get('hostname')

  if (!hostname) {
    return NextResponse.json(
      { error: 'hostname parameter required' },
      { status: 400 },
    )
  }

  try {
    const payload = await getPayload({ config: configPromise })
    const tenant = await resolveTenant(hostname, payload)

    if (!tenant) {
      return NextResponse.json(
        { error: 'No institution found for this hostname' },
        { status: 404 },
      )
    }

    return NextResponse.json({
      institutionId: tenant.institutionId,
      code: tenant.code,
      status: tenant.status,
      tier: tenant.tier,
      purpose: tenant.purpose,
      clubScope: tenant.clubScope,
      departmentScope: tenant.departmentScope,
    })
  } catch (err) {
    console.error('[resolve-tenant] Error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

/**
 * POST /api/resolve-tenant — Clear the tenant cache.
 * Called after institution domain changes. Requires superadmin auth.
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({
      headers: request.headers,
    })

    if (!user || (user as { role?: string }).role !== 'superadmin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    const hostname = (body as { hostname?: string }).hostname

    clearTenantCache(hostname || undefined)

    return NextResponse.json({
      success: true,
      message: hostname
        ? `Cache cleared for ${hostname}`
        : 'All tenant cache cleared',
    })
  } catch (err) {
    console.error('[resolve-tenant] Cache clear error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
