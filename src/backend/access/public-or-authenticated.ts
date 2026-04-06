import type { Access } from 'payload'

/**
 * Access control: allows authenticated users or published content.
 * Used for content that should be public when published but require auth for drafts.
 */
export const publicOrAuthenticated: Access = ({ req: { user } }) => {
  if (user) {
    return true
  }

  return {
    _status: {
      equals: 'published',
    },
  }
}
