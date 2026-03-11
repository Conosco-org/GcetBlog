/**
 * RBAC Permission Map — Content Engine v2 (Multi-tenant Ready)
 *
 * Single source of truth for all permissions.
 *
 * Role hierarchy:
 *   superadmin (platform owner) — manages institutions, invisible on college sites
 *     └─ institution_admin — full autonomy within one institution, can assign all roles
 *          └─ club_admin, club_editor   (scoped to club within institution)
 *          └─ blog_editor, blog_author  (scoped to blog within institution)
 *          └─ event_manager, moderator  (global within institution)
 *          └─ user (basic authenticated, institution-scoped)
 *
 * SuperAdmin bypasses everything. institution_admin bypasses all checks within their institution.
 *
 * Usage:
 *   import { PERMISSION_MAP, type Permission, ASSIGNABLE_ROLES } from '@/access/permissions'
 */

// ---------------------------------------------------------------------------
// Assignable Roles (placed in roleAssignments[].assignedRole)
// institution_admin is the college-level top admin, assigned by superadmin
// ---------------------------------------------------------------------------

export const ASSIGNABLE_ROLES = [
  'institution_admin',
  'club_admin',
  'club_editor',
  'blog_editor',
  'blog_author',
  'event_manager',
  'moderator',
] as const

export type AssignableRole = (typeof ASSIGNABLE_ROLES)[number]

// ---------------------------------------------------------------------------
// Scope Types
// ---------------------------------------------------------------------------

export const SCOPE_TYPES = ['institution', 'club', 'blog', 'global'] as const
export type ScopeType = (typeof SCOPE_TYPES)[number]

// ---------------------------------------------------------------------------
// Role Assignment Interface
// ---------------------------------------------------------------------------

export interface RoleAssignment {
  assignedRole: AssignableRole
  scopeType: ScopeType
  /** For institution scope: points to institutions collection. For club: clubs collection. */
  scopeId?: string | { id: string; [key: string]: unknown }
  scopeLabel?: string
  id?: string
}

// ---------------------------------------------------------------------------
// Permission Map
// NOTE: institution_admin is NOT listed here — it bypasses the map entirely
// (like superadmin but institution-scoped). This keeps the map clean.
// The hasPermission checker handles institution_admin as a special case.
// ---------------------------------------------------------------------------

export const PERMISSION_MAP = {
  // Blog permissions
  'blog:create_draft': ['blog_author', 'blog_editor', 'club_admin', 'club_editor'],
  'blog:edit_own': ['blog_author', 'blog_editor'],
  'blog:edit_any': ['blog_editor'],
  'blog:publish': ['blog_editor'],
  'blog:delete': ['blog_editor'],

  // Event permissions
  'event:create': ['club_admin', 'club_editor', 'event_manager'],
  'event:edit_own_club': ['club_admin', 'club_editor'],
  'event:edit_any': ['event_manager'],
  'event:publish': ['club_admin', 'event_manager'],
  'event:delete': ['club_admin', 'event_manager'],

  // Club permissions
  'club:edit_page': ['club_admin'],
  'club:manage_gallery': ['club_admin', 'club_editor'],
  'club:view_analytics': ['club_admin'],
  'club:manage_members': ['club_admin'],

  // Media permissions
  'media:upload': ['blog_author', 'blog_editor', 'club_admin', 'club_editor', 'event_manager'],
  'media:delete': ['blog_editor', 'club_admin', 'event_manager'],

  // Comment/moderation permissions
  'comment:moderate': ['moderator', 'blog_editor'],
  'comment:delete': ['moderator', 'blog_editor'],

  // Admin log reading (within institution)
  'logs:read': ['blog_editor', 'event_manager'],

  // User management within institution
  'users:manage': [],
  'users:assign_roles': [],
} as const

export type Permission = keyof typeof PERMISSION_MAP

// ---------------------------------------------------------------------------
// Role → Scope Type Mapping (which scope types are valid for each role)
// ---------------------------------------------------------------------------

export const ROLE_SCOPE_MAP: Record<AssignableRole, ScopeType[]> = {
  institution_admin: ['institution'],
  club_admin: ['club'],
  club_editor: ['club'],
  blog_editor: ['blog', 'institution'],
  blog_author: ['blog', 'institution'],
  event_manager: ['global', 'institution'],
  moderator: ['global', 'institution'],
}

// ---------------------------------------------------------------------------
// Role Labels (for UI display)
// ---------------------------------------------------------------------------

export const ROLE_LABELS: Record<AssignableRole, string> = {
  institution_admin: 'Institution Admin',
  club_admin: 'Club Admin',
  club_editor: 'Club Editor',
  blog_editor: 'Blog Editor',
  blog_author: 'Blog Author',
  event_manager: 'Event Manager',
  moderator: 'Moderator',
}

export const ROLE_DESCRIPTIONS: Record<AssignableRole, string> = {
  institution_admin:
    'Full control of an institution. Can manage users, assign roles, oversee all content.',
  club_admin: 'Full control of a specific club: events, gallery, pages, analytics.',
  club_editor: 'Create drafts for a club (events, gallery). Cannot publish.',
  blog_editor: 'Manage all blog posts. Can publish, edit, delete any post.',
  blog_author: 'Write blog post drafts. Cannot publish.',
  event_manager: 'Manage events across all clubs. Can create, edit, publish.',
  moderator: 'Moderate comments and feedback across the institution.',
}

/**
 * Roles that institution_admin can assign (all roles except institution_admin itself
 * — only superadmin can create new institution_admins).
 */
export const INSTITUTION_ASSIGNABLE_ROLES = ASSIGNABLE_ROLES.filter(
  (r) => r !== 'institution_admin',
)

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extract the raw string ID from a scopeId which may be:
 * - a plain string ID
 * - a populated object: { id: string, ... }
 * - a polymorphic relationship (unpopulated): { relationTo: string, value: string }
 * - a polymorphic relationship (populated): { relationTo: string, value: { id: string, ... } }
 */
export function resolveScopeId(
  scopeId: string | { id: string; [key: string]: unknown } | { relationTo: string; value: string | { id: string; [key: string]: unknown } } | undefined | null,
): string | undefined {
  if (!scopeId) return undefined
  if (typeof scopeId === 'string') return scopeId
  if (typeof scopeId === 'object') {
    // Polymorphic relationship format: { relationTo: 'clubs', value: '...' or { id: '...' } }
    if ('relationTo' in scopeId && 'value' in scopeId) {
      const val = (scopeId as { relationTo: string; value: string | { id: string } }).value
      if (typeof val === 'string') return val
      if (typeof val === 'object' && val !== null && 'id' in val) return val.id
      return undefined
    }
    // Simple populated object: { id: '...' }
    if ('id' in scopeId) return (scopeId as { id: string }).id
  }
  return undefined
}

/**
 * Extract institution ID from a user's institution field (may be populated or just an ID).
 */
export function resolveInstitutionId(
  institution: string | { id: string; [key: string]: unknown } | undefined | null,
): string | undefined {
  return resolveScopeId(institution)
}
