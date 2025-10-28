import type { AccessArgs } from 'payload'
import type { User } from '@/payload-types'

type HasEditorAccess = (args: AccessArgs<User>) => boolean

// Allow access to editors and admins
export const editorOnly: HasEditorAccess = ({ req: { user } }) => {
  // Allow both editor and admin roles
  return Boolean(user?.role === 'editor' || user?.role === 'admin')
}
