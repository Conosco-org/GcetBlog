export const ROLES = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  CONTRIBUTOR: 'contributor',
  USER: 'user',
} as const

export type UserRole = typeof ROLES[keyof typeof ROLES]
