import type { Access } from 'payload'

/**
 * Contributors can only access their own content.
 * Editors have full access to all content.
 */
export const contributorOwn: Access = ({ req: { user } }) => {
  if (!user) return false

  const typedUser = user as unknown as Record<string, unknown>

  // Editors can access everything
  if (typedUser.role === 'editor') {
    return true
  }

  // Contributors can only access their own content
  return {
    'authors.id': { equals: user.id },
  }
}
