import type { AccessArgs } from 'payload'
import type { User } from '@/payload-types'

type HasEditorAccess = (args: AccessArgs<User>) => boolean

// Only editors can access, admins are explicitly excluded
export const editorOnly: HasEditorAccess = ({ req: { user } }) => {
  // Must be editor role specifically (not admin)
  return Boolean(user?.role === 'editor')
}
