import type { Access } from 'payload'

/**
 * Access control: admins (isAdmin=true) can access all records.
 * Other authenticated users can only access their own record.
 */
export const adminOrSelf: Access = ({ req: { user } }) => {
  if (!user) return false

  const typedUser = user as unknown as Record<string, unknown>
  if (typedUser.isAdmin === true) {
    return true
  }

  // Users can only update their own profile
  return {
    id: {
      equals: user.id,
    },
  }
}
