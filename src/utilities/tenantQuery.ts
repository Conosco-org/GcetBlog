/**
 * Tenant Query Guard — Multi-Tenant Architecture (v3)
 *
 * CRITICAL SECURITY LAYER: These wrapper functions ensure every Payload query
 * is automatically scoped to the current tenant's institution. This prevents
 * cross-tenant data leakage — the #1 SaaS security bug.
 *
 * RULE: Never use raw `payload.find()` for tenant-scoped collections.
 *       Always use `tenantFind()`, `tenantCreate()`, etc.
 *
 * Usage:
 *   import { tenantFind, tenantCreate } from '@/utilities/tenantQuery'
 *
 *   // Automatically injects institution filter
 *   const posts = await tenantFind(payload, 'posts', tenantId, {
 *     where: { _status: { equals: 'published' } },
 *     limit: 10,
 *   })
 *
 * Collections that MUST use tenant queries:
 *   posts, pages, categories, votes, page-views, templates,
 *   newsletters, newsletter-subscribers, newsletter-events,
 *   admin-logs, comments, feedback, media, clubs, events
 *
 * Collections that are GLOBAL (no tenant filter):
 *   institutions, users (has own institution field + access control),
 *   redirects, forms, form-submissions, search,
 *   payload-kv, payload-jobs, payload-locked-documents,
 *   payload-preferences, payload-migrations
 */

import type { BasePayload, Where } from 'payload'
import type { Config } from '@/payload-types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Collections that have an `institution` field and MUST be tenant-scoped */
type TenantScopedCollection =
  | 'posts'
  | 'pages'
  | 'categories'
  | 'votes'
  | 'page-views'
  | 'templates'
  | 'newsletters'
  | 'newsletter-subscribers'
  | 'newsletter-events'
  | 'admin-logs'
  | 'comments'
  | 'feedback'
  | 'media'
  | 'clubs'
  | 'events'
  | 'departments'

/** The document type for a given collection slug */
type DocType<T extends TenantScopedCollection> = Config['collections'][T]

/** Options for tenantFind (mirrors Payload find options minus collection/where) */
interface TenantFindOptions {
  where?: Where
  limit?: number
  page?: number
  sort?: string
  depth?: number
  pagination?: boolean
  draft?: boolean
  overrideAccess?: boolean
  select?: Record<string, unknown>
}

/** Options for tenantCount */
interface TenantCountOptions {
  where?: Where
  overrideAccess?: boolean
}

/** Options for tenantCreate */
interface TenantCreateOptions {
  depth?: number
  draft?: boolean
  overrideAccess?: boolean
  select?: Record<string, unknown>
}

/** Options for tenantUpdate */
interface TenantUpdateOptions {
  where?: Where
  depth?: number
  draft?: boolean
  overrideAccess?: boolean
  select?: Record<string, unknown>
}

/** Options for tenantUpdateByID */
interface TenantUpdateByIDOptions {
  depth?: number
  draft?: boolean
  overrideAccess?: boolean
  select?: Record<string, unknown>
}

/** Options for tenantDelete */
interface TenantDeleteOptions {
  where?: Where
  overrideAccess?: boolean
}

// ---------------------------------------------------------------------------
// Core: Inject institution filter into any Where clause
// ---------------------------------------------------------------------------

/**
 * Merges institution filter with existing where clause.
 * This is the heart of tenant isolation — every query MUST pass through here.
 */
function scopeWhere(tenantId: string, existingWhere?: Where): Where {
  const tenantFilter: Where = {
    institution: { equals: tenantId },
  }

  if (!existingWhere || Object.keys(existingWhere).length === 0) {
    return tenantFilter
  }

  // Merge: AND the tenant filter with the existing where
  return {
    and: [tenantFilter, existingWhere],
  }
}

// ---------------------------------------------------------------------------
// Tenant-Scoped Query Functions
// ---------------------------------------------------------------------------

/**
 * Find documents scoped to a tenant's institution.
 *
 * @example
 * ```ts
 * const result = await tenantFind(payload, 'posts', tenantId, {
 *   where: { _status: { equals: 'published' } },
 *   limit: 10,
 *   sort: '-createdAt',
 * })
 * ```
 */
export async function tenantFind<C extends TenantScopedCollection>(
  payload: BasePayload,
  collection: C,
  tenantId: string,
  options: TenantFindOptions = {},
): Promise<{ docs: DocType<C>[]; totalDocs: number; totalPages: number; page: number; hasNextPage: boolean; hasPrevPage: boolean }> {
  const { where, ...rest } = options

  const result = await payload.find({
    collection,
    where: scopeWhere(tenantId, where),
    ...rest,
  })

  return result as {
    docs: DocType<C>[]
    totalDocs: number
    totalPages: number
    page: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

/**
 * Count documents scoped to a tenant's institution.
 *
 * @example
 * ```ts
 * const { totalDocs } = await tenantCount(payload, 'posts', tenantId, {
 *   where: { _status: { equals: 'published' } },
 * })
 * ```
 */
export async function tenantCount<C extends TenantScopedCollection>(
  payload: BasePayload,
  collection: C,
  tenantId: string,
  options: TenantCountOptions = {},
): Promise<{ totalDocs: number }> {
  const { where, ...rest } = options

  return payload.count({
    collection,
    where: scopeWhere(tenantId, where),
    ...rest,
  })
}

/**
 * Find a single document by ID — with tenant verification.
 * Fetches the doc and verifies it belongs to the given tenant.
 * Throws if the document belongs to a different institution.
 *
 * @example
 * ```ts
 * const post = await tenantFindByID(payload, 'posts', tenantId, postId)
 * ```
 */
export async function tenantFindByID<C extends TenantScopedCollection>(
  payload: BasePayload,
  collection: C,
  tenantId: string,
  id: string,
  options: { depth?: number; draft?: boolean; overrideAccess?: boolean; select?: Record<string, unknown> } = {},
): Promise<DocType<C>> {
  const doc = await payload.findByID({
    collection,
    id,
    ...options,
  })

  // Verify tenant ownership
  const docInstitution = (doc as unknown as Record<string, unknown>).institution
  const docInstId =
    typeof docInstitution === 'object' && docInstitution !== null
      ? (docInstitution as { id: string }).id
      : String(docInstitution)

  if (docInstId !== tenantId) {
    throw new TenantMismatchError(collection, id, tenantId)
  }

  return doc as DocType<C>
}

/**
 * Create a document with the institution automatically set.
 *
 * @example
 * ```ts
 * const post = await tenantCreate(payload, 'posts', tenantId, {
 *   title: 'Hello World',
 *   content: richTextContent,
 * })
 * ```
 */
export async function tenantCreate<C extends TenantScopedCollection>(
  payload: BasePayload,
  collection: C,
  tenantId: string,
  data: Record<string, unknown>,
  options: TenantCreateOptions = {},
): Promise<DocType<C>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await (payload as any).create({
    collection,
    data: { ...data, institution: tenantId },
    ...options,
  })

  return result as DocType<C>
}

/**
 * Update a document by ID — with tenant verification.
 * Ensures the document belongs to the tenant before updating.
 *
 * @example
 * ```ts
 * const updated = await tenantUpdateByID(payload, 'posts', tenantId, postId, {
 *   title: 'Updated Title',
 * })
 * ```
 */
export async function tenantUpdateByID<C extends TenantScopedCollection>(
  payload: BasePayload,
  collection: C,
  tenantId: string,
  id: string,
  data: Record<string, unknown>,
  options: TenantUpdateByIDOptions = {},
): Promise<DocType<C>> {
  // First verify ownership
  await tenantFindByID(payload, collection, tenantId, id, {
    depth: 0,
    overrideAccess: options.overrideAccess,
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await (payload as any).update({
    collection,
    id,
    data: { ...data, institution: tenantId },
    ...options,
  })

  return result as DocType<C>
}

/**
 * Bulk update documents — scoped to tenant's institution.
 *
 * @example
 * ```ts
 * const result = await tenantUpdate(payload, 'posts', tenantId, {
 *   _status: 'draft',
 * }, { where: { author: { equals: userId } } })
 * ```
 */
export async function tenantUpdate<C extends TenantScopedCollection>(
  payload: BasePayload,
  collection: C,
  tenantId: string,
  data: Record<string, unknown>,
  options: TenantUpdateOptions = {},
): Promise<{ docs: DocType<C>[]; errors: unknown[] }> {
  const { where, ...rest } = options

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await (payload as any).update({
    collection,
    where: scopeWhere(tenantId, where),
    data: { ...data, institution: tenantId },
    ...rest,
  })

  return result as { docs: DocType<C>[]; errors: unknown[] }
}

/**
 * Delete a document by ID — with tenant verification.
 */
export async function tenantDeleteByID<C extends TenantScopedCollection>(
  payload: BasePayload,
  collection: C,
  tenantId: string,
  id: string,
  options: { overrideAccess?: boolean } = {},
): Promise<DocType<C>> {
  // Verify ownership before delete
  await tenantFindByID(payload, collection, tenantId, id, {
    depth: 0,
    overrideAccess: options.overrideAccess,
  })

  const result = await payload.delete({
    collection,
    id,
    ...options,
  })

  return result as DocType<C>
}

/**
 * Bulk delete documents — scoped to tenant's institution.
 */
export async function tenantDelete<C extends TenantScopedCollection>(
  payload: BasePayload,
  collection: C,
  tenantId: string,
  options: TenantDeleteOptions = {},
): Promise<{ docs: DocType<C>[]; errors: unknown[] }> {
  const { where, ...rest } = options

  const result = await payload.delete({
    collection,
    where: scopeWhere(tenantId, where),
    ...rest,
  })

  return result as { docs: DocType<C>[]; errors: unknown[] }
}

// ---------------------------------------------------------------------------
// Error class for tenant mismatch
// ---------------------------------------------------------------------------

export class TenantMismatchError extends Error {
  public readonly collection: string
  public readonly documentId: string
  public readonly expectedTenantId: string

  constructor(collection: string, documentId: string, expectedTenantId: string) {
    super(
      `Tenant isolation violation: Document ${documentId} in "${collection}" does not belong to institution ${expectedTenantId}`,
    )
    this.name = 'TenantMismatchError'
    this.collection = collection
    this.documentId = documentId
    this.expectedTenantId = expectedTenantId
  }
}

// ---------------------------------------------------------------------------
// Helper: Get tenant-scoped payload wrapper (convenience for Server Actions)
// ---------------------------------------------------------------------------

/**
 * Creates a pre-scoped query object for a specific tenant.
 * Useful in server actions where you have tenantId early and make many queries.
 *
 * @example
 * ```ts
 * const tenant = await requireTenant()
 * const tq = createTenantQueries(payload, tenant.institutionId)
 *
 * const posts = await tq.find('posts', { limit: 10 })
 * const count = await tq.count('posts')
 * const post = await tq.create('posts', { title: 'New Post' })
 * ```
 */
export function createTenantQueries(payload: BasePayload, tenantId: string) {
  return {
    find: <C extends TenantScopedCollection>(
      collection: C,
      options?: TenantFindOptions,
    ) => tenantFind(payload, collection, tenantId, options),

    count: <C extends TenantScopedCollection>(
      collection: C,
      options?: TenantCountOptions,
    ) => tenantCount(payload, collection, tenantId, options),

    findByID: <C extends TenantScopedCollection>(
      collection: C,
      id: string,
      options?: { depth?: number; draft?: boolean; overrideAccess?: boolean },
    ) => tenantFindByID(payload, collection, tenantId, id, options),

    create: <C extends TenantScopedCollection>(
      collection: C,
      data: Record<string, unknown>,
      options?: TenantCreateOptions,
    ) => tenantCreate(payload, collection, tenantId, data, options),

    updateByID: <C extends TenantScopedCollection>(
      collection: C,
      id: string,
      data: Record<string, unknown>,
      options?: TenantUpdateByIDOptions,
    ) => tenantUpdateByID(payload, collection, tenantId, id, data, options),

    update: <C extends TenantScopedCollection>(
      collection: C,
      data: Record<string, unknown>,
      options?: TenantUpdateOptions,
    ) => tenantUpdate(payload, collection, tenantId, data, options),

    deleteByID: <C extends TenantScopedCollection>(
      collection: C,
      id: string,
      options?: { overrideAccess?: boolean },
    ) => tenantDeleteByID(payload, collection, tenantId, id, options),

    delete: <C extends TenantScopedCollection>(
      collection: C,
      options?: TenantDeleteOptions,
    ) => tenantDelete(payload, collection, tenantId, options),
  }
}
