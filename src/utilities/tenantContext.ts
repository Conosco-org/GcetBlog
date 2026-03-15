/**
 * Server-side Tenant Utilities — Multi-Tenant Architecture (v3)
 *
 * These functions run in Server Components, Route Handlers, and Server Actions.
 * They read the tenant info from headers (set by middleware) or resolve directly.
 *
 * Usage in a Server Component:
 *   const tenant = await getCurrentTenant()
 *   // tenant.institutionId — use in Payload queries
 *   // tenant.code — use for branding/display
 *
 * Usage in a Route Handler:
 *   const tenant = getTenantFromRequestHeaders(request.headers)
 */

import { headers } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import {
  TENANT_HEADER,
  TENANT_CODE_HEADER,
  TENANT_CLUB_SCOPE_HEADER,
  TENANT_PURPOSE_HEADER,
  resolveTenant,
  type ResolvedTenant,
} from '@/utilities/tenantResolver'

export type { ResolvedTenant }

// ---------------------------------------------------------------------------
// Server Component: Get current tenant from middleware headers
// ---------------------------------------------------------------------------

export interface TenantContext {
  /** Institution document ID */
  institutionId: string
  /** Institution code (e.g., 'gcet') */
  code: string
  /** Domain purpose — determines content filtering */
  purpose: 'main' | 'blog' | 'club' | 'department'
  /** Club scope (if domain is club-specific) */
  clubScope?: string
  /** Full institution data (lazy-loaded when needed) */
  institution?: ResolvedTenant
}

/**
 * Get the current tenant from middleware headers (fast, no DB hit).
 * Returns null if no tenant was resolved (e.g., platform routes).
 *
 * @example
 * ```tsx
 * // In a Server Component
 * const tenant = await getCurrentTenant()
 * if (!tenant) return <div>No institution context</div>
 *
 * const posts = await payload.find({
 *   collection: 'posts',
 *   where: { institution: { equals: tenant.institutionId } },
 * })
 * ```
 */
export async function getCurrentTenant(): Promise<TenantContext | null> {
  const hdrs = await headers()
  const institutionId = hdrs.get(TENANT_HEADER)
  const code = hdrs.get(TENANT_CODE_HEADER)

  if (!institutionId || !code) return null

  return {
    institutionId,
    code,
    purpose: (hdrs.get(TENANT_PURPOSE_HEADER) || 'main') as TenantContext['purpose'],
    clubScope: hdrs.get(TENANT_CLUB_SCOPE_HEADER) || undefined,
  }
}

/**
 * Get the current tenant with full institution data (DB hit).
 * Use when you need branding, tier, enabled modules, etc.
 * Returns null if no tenant headers are present (platform context).
 */
export async function getCurrentTenantFull(): Promise<ResolvedTenant | null> {
  const basic = await getCurrentTenant()
  if (!basic) return null

  // If we have tenant headers, get the full data
  const payload = await getPayload({ config: configPromise })
  const hostname = (await headers()).get('host') || 'localhost'

  return resolveTenant(hostname, payload)
}

// ---------------------------------------------------------------------------
// Route Handler: Get tenant from request headers directly
// ---------------------------------------------------------------------------

/**
 * Extract tenant info from request headers (for use in Route Handlers).
 *
 * @example
 * ```ts
 * export async function GET(request: NextRequest) {
 *   const tenant = getTenantFromRequestHeaders(request.headers)
 *   if (!tenant) return NextResponse.json({ error: 'No tenant' }, { status: 400 })
 *   // ... scope queries to tenant.institutionId
 * }
 * ```
 */
export function getTenantFromRequestHeaders(
  hdrs: Headers,
): TenantContext | null {
  const institutionId = hdrs.get(TENANT_HEADER)
  const code = hdrs.get(TENANT_CODE_HEADER)

  if (!institutionId || !code) return null

  return {
    institutionId,
    code,
    purpose: (hdrs.get(TENANT_PURPOSE_HEADER) || 'main') as TenantContext['purpose'],
    clubScope: hdrs.get(TENANT_CLUB_SCOPE_HEADER) || undefined,
  }
}

// ---------------------------------------------------------------------------
// Server Action helper: Ensure tenant context exists
// ---------------------------------------------------------------------------

/**
 * Require a tenant context (throw if not resolved).
 * Use in server actions that must be institution-scoped.
 */
export async function requireTenant(): Promise<TenantContext> {
  const tenant = await getCurrentTenant()
  if (!tenant) {
    throw new Error('No institution context. This action requires a resolved tenant.')
  }
  return tenant
}
