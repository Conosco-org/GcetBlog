/**
 * SuperAdmin Access Control — Content Engine v2 RBAC
 *
 * Replaces the old `adminOnly.ts` / `isAdminAccess.ts` checks.
 * Checks `user.role === 'superadmin'` instead of `user.isAdmin === true`.
 */

import type { Access, FieldAccess } from 'payload'

/**
 * Payload collection-level access: only superadmins.
 */
export const isSuperAdmin: Access = ({ req: { user } }) => {
  if (!user) return false
  return user.role === 'superadmin'
}

/**
 * Payload field-level access: only superadmins.
 */
export const isSuperAdminField: FieldAccess = ({ req: { user } }) => {
  if (!user) return false
  return user.role === 'superadmin'
}
