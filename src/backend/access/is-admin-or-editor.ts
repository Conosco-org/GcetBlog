import type { Access } from 'payload'

/**
 * Access control: allows users with admin or editor role.
 * Used for content management operations.
 */
export const isAdminOrEditor: Access = ({ req: { user } }) => {
  if (!user || typeof user !== 'object') return false
  const typedUser = user as unknown as Record<string, unknown>
  return Boolean(typedUser.role === 'admin' || typedUser.role === 'editor')
}
