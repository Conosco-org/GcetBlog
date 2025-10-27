/**
 * Utility function to check if a user has a specific role
 */

type UserWithRole = {
  role?: string
  [key: string]: unknown
}

export const isAdmin = (user: UserWithRole | Record<string, unknown> | null | undefined): boolean => {
  if (!user || typeof user !== 'object') return false
  return 'role' in user && user.role === 'admin'
}

export const isEditor = (user: UserWithRole | Record<string, unknown> | null | undefined): boolean => {
  if (!user || typeof user !== 'object') return false
  return 'role' in user && user.role === 'editor'
}

export const isEditorOrAdmin = (user: UserWithRole | Record<string, unknown> | null | undefined): boolean => {
  if (!user || typeof user !== 'object') return false
  return 'role' in user && (user.role === 'editor' || user.role === 'admin')
}
