/**
 * Core Shared Types
 *
 * Types used across multiple modules. Keep this lean —
 * module-specific types go in their respective module folders.
 */

// ---------------------------------------------------------------------------
// Action results (used by server actions across modules)
// ---------------------------------------------------------------------------

export interface ActionResult {
  success: boolean
  message: string
}

export interface ActionResultWithData<T> extends ActionResult {
  data?: T
}

// ---------------------------------------------------------------------------
// Pagination (shared between CMS and API responses)
// ---------------------------------------------------------------------------

export interface PaginationInfo {
  page: number
  totalPages: number
  totalDocs: number
  limit: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

// ---------------------------------------------------------------------------
// Data source discriminator (Doctrine Rule: CMS vs external)
// ---------------------------------------------------------------------------

export type DataSource = 'manual' | 'conosco'

// ---------------------------------------------------------------------------
// Module identifiers (for activity logging)
// ---------------------------------------------------------------------------

export type ModuleIdentifier =
  | 'content'
  | 'events'
  | 'clubs'
  | 'departments'
  | 'media'
  | 'newsletter'
  | 'users'
  | 'system'
