/**
 * Utility functions to check user roles and permissions.
 *
 * Role hierarchy:
 *   contributor < editor < editor+isAdmin < editor+isAdmin+canManageAdmins
 *
 * - role: 'contributor' | 'editor'
 * - isAdmin: boolean - grants user management capabilities
 * - canManageAdmins: boolean - can manage other admins, and cannot be deleted
 */

type UserWithRole = {
  role?: string
  isAdmin?: boolean
  canManageAdmins?: boolean
  [key: string]: unknown
}

/** Check if user is an editor (the only content management role) */
export const isEditor = (user: UserWithRole | Record<string, unknown> | null | undefined): boolean => {
  if (!user || typeof user !== 'object') return false
  return 'role' in user && user.role === 'editor'
}

/** Check if user has admin privileges (isAdmin flag) */
export const isAdmin = (user: UserWithRole | Record<string, unknown> | null | undefined): boolean => {
  if (!user || typeof user !== 'object') return false
  return 'isAdmin' in user && user.isAdmin === true
}

/** Check if user can manage other admin users */
export const canManageAdmins = (user: UserWithRole | Record<string, unknown> | null | undefined): boolean => {
  if (!user || typeof user !== 'object') return false
  return 'canManageAdmins' in user && user.canManageAdmins === true
}

/**
 * @deprecated No longer needed - admin role merged into editor.
 * Kept for backward compatibility during migration. Use isEditor() instead.
 */
export const isEditorOrAdmin = (user: UserWithRole | Record<string, unknown> | null | undefined): boolean => {
  return isEditor(user)
}
