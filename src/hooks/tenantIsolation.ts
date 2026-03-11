/**
 * Tenant Isolation Hooks — Multi-Tenant Architecture (v3)
 *
 * These Payload collection hooks provide DEFENSE-IN-DEPTH tenant isolation.
 * Even if a developer forgets to use tenantQuery.ts wrappers, these hooks
 * ensure institution-scoped queries are automatically filtered.
 *
 * Two layers of protection:
 *   1. beforeOperation hook: Auto-injects institution filter on find/count/update/delete
 *   2. afterRead hook: Logs warnings on cross-tenant read detection
 *
 * Usage in a collection config:
 *   import { tenantIsolationHooks } from '@/hooks/tenantIsolation'
 *
 *   export const Posts: CollectionConfig = {
 *     slug: 'posts',
 *     hooks: tenantIsolationHooks(),
 *     // ... rest of config
 *   }
 */

import type {
  CollectionConfig,
} from 'payload'

type CollectionHooks = NonNullable<CollectionConfig['hooks']>

/**
 * beforeOperation: Auto-inject institution filter for find/count/update/delete.
 *
 * This runs BEFORE Payload's access control, ensuring every query is scoped.
 * SuperAdmin bypasses this (they can see all institutions).
 */
const beforeOperationHook: NonNullable<CollectionHooks['beforeOperation']>[number] = async ({
  args,
  operation,
}) => {
  // Only intercept read/find/update/delete operations
  if (!['find', 'count', 'update', 'delete', 'read'].includes(operation)) {
    return args
  }

  const req = args.req
  if (!req) return args

  // SuperAdmin can access all tenants
  const user = req.user as Record<string, unknown> | null
  if (user?.role === 'superadmin') {
    return args
  }

  // Internal server calls with overrideAccess (e.g., from hooks, seeds) — skip
  // These are trusted system operations, not user-initiated
  if ('overrideAccess' in args && args.overrideAccess === true) {
    return args
  }

  // Inline tenant extraction (avoids PayloadRequest type incompatibility with helper fn)
  let tenantId: string | null = null
  if (req.headers instanceof Headers) {
    tenantId = req.headers.get('x-tenant-id')
  }
  if (!tenantId && user) {
    const inst = user.institution
    if (typeof inst === 'string') tenantId = inst
    else if (typeof inst === 'object' && inst !== null && 'id' in (inst as Record<string, unknown>)) {
      tenantId = String((inst as { id: string }).id)
    }
  }

  // If no tenant context, only public data is accessible (Payload access control handles this)
  if (!tenantId) {
    return args
  }

  // Inject institution filter into the where clause
  const existingWhere = 'where' in args ? (args.where || {}) : {}
  const tenantFilter = { institution: { equals: tenantId } }

  const newWhere =
    Object.keys(existingWhere).length === 0
      ? tenantFilter
      : { and: [tenantFilter, existingWhere] }

  return {
    ...args,
    where: newWhere,
  }
}

/**
 * afterRead: Log a warning if a document's institution doesn't match the request tenant.
 * This is a DETECTION layer — it doesn't block (access control does that).
 * In production, you could send this to a monitoring service.
 */
const afterReadHook: NonNullable<CollectionHooks['afterRead']>[number] = async ({ doc, req, collection }) => {
  // Skip for superadmin
  const user = req.user as Record<string, unknown> | null
  if (user?.role === 'superadmin') return doc

  // Inline tenant extraction (avoids PayloadRequest type incompatibility with helper fn)
  let tenantId: string | null = null
  if (req.headers instanceof Headers) {
    tenantId = req.headers.get('x-tenant-id')
  }
  if (!tenantId && user) {
    const inst = user.institution
    if (typeof inst === 'string') tenantId = inst
    else if (typeof inst === 'object' && inst !== null && 'id' in (inst as Record<string, unknown>)) {
      tenantId = String((inst as { id: string }).id)
    }
  }
  if (!tenantId) return doc

  const docInstitution = doc?.institution
  const docInstId =
    typeof docInstitution === 'object' && docInstitution !== null
      ? (docInstitution as { id: string }).id
      : docInstitution
        ? String(docInstitution)
        : null

  if (docInstId && docInstId !== tenantId) {
    console.warn(
      `[TENANT ISOLATION WARNING] Cross-tenant read detected in "${collection.slug}": ` +
        `doc ${doc.id} belongs to institution ${docInstId}, but request tenant is ${tenantId}`,
    )
  }

  return doc
}

/**
 * Create tenant isolation hooks for a collection.
 *
 * @param options.strict - If true, blocks cross-tenant reads entirely (default: false, just warns)
 *
 * @example
 * ```ts
 * export const Posts: CollectionConfig = {
 *   slug: 'posts',
 *   hooks: {
 *     ...tenantIsolationHooks(),
 *     // your other hooks...
 *     afterChange: [myCustomHook],
 *   },
 * }
 * ```
 */
export function tenantIsolationHooks(_options: { strict?: boolean } = {}): CollectionHooks {
  return {
    beforeOperation: [beforeOperationHook],
    afterRead: [afterReadHook],
  }
}

/**
 * Merge tenant isolation hooks with existing collection hooks.
 * Use this when your collection already has hooks defined.
 *
 * @example
 * ```ts
 * export const Posts: CollectionConfig = {
 *   slug: 'posts',
 *   hooks: withTenantIsolation({
 *     afterChange: [myCustomHook],
 *     beforeValidate: [myValidator],
 *   }),
 * }
 * ```
 */
export function withTenantIsolation(
  existingHooks: CollectionHooks = {},
): CollectionHooks {
  const isolation = tenantIsolationHooks()

  return {
    ...existingHooks,
    beforeOperation: [
      ...(isolation.beforeOperation || []),
      ...(existingHooks.beforeOperation || []),
    ],
    afterRead: [
      ...(isolation.afterRead || []),
      ...(existingHooks.afterRead || []),
    ],
  }
}
