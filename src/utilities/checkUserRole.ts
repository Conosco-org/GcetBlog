/**
 * Utility functions to check user roles and permissions (client-side).
 *
 * Multi-tenant role hierarchy:
 *   superadmin (platform owner)
 *     └─ institution_admin (college-level admin, full autonomy)
 *          └─ club_admin, club_editor, blog_editor, blog_author, event_manager, moderator
 *
 * Base role on user: 'superadmin' | 'user'
 * Scoped roles are stored in user.roleAssignments[]
 */

type RoleAssignment = {
  assignedRole: string
  scopeType?: string
  scopeId?: string | { id: string; [key: string]: unknown }
  scopeLabel?: string
}

type UserWithRole = {
  role?: string
  roleAssignments?: RoleAssignment[]
  institution?: string | { id: string; [key: string]: unknown }
  [key: string]: unknown
}

/** Check if user is superadmin (platform owner) */
export const isSuperAdmin = (user: UserWithRole | Record<string, unknown> | null | undefined): boolean => {
  if (!user || typeof user !== 'object') return false
  return 'role' in user && user.role === 'superadmin'
}

/** Check if user has institution_admin role */
export const isInstitutionAdmin = (user: UserWithRole | Record<string, unknown> | null | undefined): boolean => {
  if (!user || typeof user !== 'object') return false
  if (isSuperAdmin(user)) return true
  const u = user as UserWithRole
  return u.roleAssignments?.some(a => a.assignedRole === 'institution_admin') ?? false
}

/** Check if user has any of the specified roles in their roleAssignments */
export const hasRole = (
  user: UserWithRole | Record<string, unknown> | null | undefined,
  roles: string[],
): boolean => {
  if (!user || typeof user !== 'object') return false
  if (isSuperAdmin(user)) return true
  const u = user as UserWithRole
  if (isInstitutionAdmin(u)) return true
  return u.roleAssignments?.some(a => roles.includes(a.assignedRole)) ?? false
}

/** Check if user can manage content (has any editorial role) */
export const isEditor = (user: UserWithRole | Record<string, unknown> | null | undefined): boolean => {
  return hasRole(user, ['blog_editor', 'institution_admin'])
}

/**
 * @deprecated Use isInstitutionAdmin() or isSuperAdmin() instead.
 * Kept for backward compatibility during migration.
 */
export const isAdmin = isInstitutionAdmin

/**
 * @deprecated Use hasRole() instead.
 * Kept for backward compatibility during migration.
 */
export const canManageAdmins = isSuperAdmin

/**
 * @deprecated Use isEditor() instead.
 */
export const isEditorOrAdmin = isEditor

/** Check if user has any role assignments at all */
export const hasAnyRole = (user: UserWithRole | Record<string, unknown> | null | undefined): boolean => {
  if (!user || typeof user !== 'object') return false
  if (isSuperAdmin(user)) return true
  const u = user as UserWithRole
  return (u.roleAssignments?.length ?? 0) > 0
}

/** Get the best dashboard URL for a user based on their roles */
export const getDashboardUrl = (user: UserWithRole | Record<string, unknown> | null | undefined): string => {
  if (isSuperAdmin(user)) return '/platform'
  if (isInstitutionAdmin(user)) return '/admin-dashboard'
  if (hasAnyRole(user)) return '/editor'
  return '/'
}
