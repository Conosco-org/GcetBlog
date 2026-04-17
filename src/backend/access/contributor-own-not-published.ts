import type { Access } from 'payload'

/**
 * Contributors can only delete their own content that is NOT published.
 * Editors and admins can delete everything.
 */
export const contributorOwnNotPublished: Access = ({ req: { user }, data }) => {
  if (!user) return false

  const typedUser = user as unknown as Record<string, unknown>

  // Editors and admins can delete everything
  if (typedUser.role === 'editor' || typedUser.role === 'admin') {
    return true
  }

  // Contributors can only delete their own content that is NOT published
  // Check if the post is published
  if (data?._status === 'published') {
    return false
  }

  // Contributors can only delete their own content
  return {
    'authors.id': { equals: user.id },
  }
}
