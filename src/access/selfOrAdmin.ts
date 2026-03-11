/**
 * Self or Admin Access Control — Content Engine v2 RBAC (Multi-tenant Ready)
 *
 * Replaces the old `adminOrSelf.ts`.
 *
 * Access hierarchy:
 *   superadmin → can access all users across all institutions
 *   institution_admin → can access all users within their institution
 *   user → can only access their own record
 */

import type { Access, Where } from 'payload'
import { isInstitutionAdmin, getUserInstitutionId } from './hasPermission'
import { resolveInstitutionId } from './permissions'

/**
 * Payload access control: superadmin OR institution_admin (within institution) OR self.
 * Used for Users collection read/update — users can see/edit their own profile,
 * institution_admins can manage users in their institution,
 * superadmins can manage anyone.
 */
export const selfOrAdmin: Access = ({ req: { user } }) => {
  if (!user) return false

  // SuperAdmin can access all records across institutions
  if (user.role === 'superadmin') return true

  // institution_admin can access all users in their institution
  const userInstId = getUserInstitutionId(user)
  if (userInstId && isInstitutionAdmin(user, userInstId)) {
    return {
      institution: { equals: userInstId },
    } as Where
  }

  // Everyone else can only access their own record
  return {
    id: { equals: user.id },
  }
}
