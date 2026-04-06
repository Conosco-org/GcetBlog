import type { Access } from 'payload'

/**
 * Access control: allows editors (role === 'editor').
 * Since admins are now editors with isAdmin=true, this covers all content managers.
 */
export const editorOnly: Access = ({ req: { user } }) => {
  if (!user || typeof user !== 'object') return false
  return Boolean((user as unknown as Record<string, unknown>).role === 'editor')
}
