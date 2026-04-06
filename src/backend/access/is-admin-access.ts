import type { Access } from 'payload'

/**
 * Access control: allows only users with isAdmin flag.
 * Used for user management operations (delete users, process role requests, etc.)
 */
export const isAdminAccess: Access = ({ req: { user } }) => {
  if (!user || typeof user !== 'object') return false
  return Boolean((user as unknown as Record<string, unknown>).isAdmin === true)
}
