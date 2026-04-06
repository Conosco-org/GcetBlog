import type { Access } from 'payload'

/**
 * Access control: allows only users with admin role.
 * Used for admin-only operations.
 */
export const isAdmin: Access = ({ req: { user } }) => {
  if (!user || typeof user !== 'object') return false
  const typedUser = user as unknown as Record<string, unknown>
  return Boolean(typedUser.role === 'admin')
}
