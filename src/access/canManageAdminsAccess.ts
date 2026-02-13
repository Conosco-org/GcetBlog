import type { Access } from 'payload'

/**
 * Access control: allows only users with canManageAdmins flag.
 * Used for managing admin users (creating/editing/deleting isAdmin users).
 * Users with canManageAdmins=true cannot be deleted by anyone.
 */
export const canManageAdminsAccess: Access = ({ req: { user } }) => {
  if (!user || typeof user !== 'object') return false
  return Boolean((user as unknown as Record<string, unknown>).canManageAdmins === true)
}
