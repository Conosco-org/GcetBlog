import type { Access } from 'payload'

/**
 * Access control: allows any authenticated user.
 * Used for operations that require login but no specific role.
 */
export const isAuthenticated: Access = ({ req: { user } }) => {
  return Boolean(user)
}
