import type { AccessArgs } from 'payload'
import type { User } from '@/payload-types'

type HasEditorAccess = (args: AccessArgs<User>) => boolean

export const editorOrAdmin: HasEditorAccess = ({ req: { user } }) => {
  return Boolean(user?.role === 'editor' || user?.role === 'admin')
}
