import type { AccessArgs } from 'payload'
import type { User } from '@/payload-types'

/**
 * Contributors can only access their own content
 * Editors and admins have full access
 */
type ContributorOwnAccess = (args: AccessArgs<User>) => boolean | object

export const contributorOwn: ContributorOwnAccess = ({ req: { user } }) => {
  if (!user) return false

  const typedUser = user as User & { role: string }

  // Admins and editors can access everything
  if (['admin', 'editor'].includes(typedUser.role)) {
    return true
  }

  // Contributors can only access their own content
  // This returns a query constraint that filters by author/user ID
  return {
    'authors.id': { equals: user.id },
  }
}
