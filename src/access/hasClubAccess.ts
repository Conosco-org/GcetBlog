/**
 * Club Access Helpers — Content Engine v2 RBAC (Multi-tenant Ready)
 *
 * Shortcut functions for checking club-scoped permissions.
 * All checks are institution-isolated.
 */

import type { Access, Where } from 'payload'
import {
  checkPermission,
  getUserInstitutionId,
  isOwnInstitutionAdmin,
  type RBACUser,
} from './hasPermission'
import { resolveScopeId, resolveInstitutionId, type RoleAssignment } from './permissions'

/**
 * Check if user has any club-level role for a specific club.
 */
export function isClubMember(user: unknown, clubId: string): boolean {
  if (!user || typeof user !== 'object') return false
  const u = user as RBACUser
  if (u.role === 'superadmin') return true
  if (isOwnInstitutionAdmin(u)) return true

  const assignments = (u.roleAssignments || []) as RoleAssignment[]
  return assignments.some((a) => {
    if (a.scopeType !== 'club') return false
    const scopeId = resolveScopeId(a.scopeId)
    return scopeId === clubId
  })
}

/**
 * Check if user is a club_admin for a specific club.
 */
export function isClubAdmin(user: unknown, clubId: string): boolean {
  if (!user || typeof user !== 'object') return false
  const u = user as RBACUser
  if (u.role === 'superadmin') return true
  if (isOwnInstitutionAdmin(u)) return true

  const assignments = (u.roleAssignments || []) as RoleAssignment[]
  return assignments.some((a) => {
    if (a.assignedRole !== 'club_admin') return false
    if (a.scopeType !== 'club') return false
    const scopeId = resolveScopeId(a.scopeId)
    return scopeId === clubId
  })
}

/**
 * Get all club IDs where user has club_admin role.
 * Returns empty for superadmin/institution_admin (meaning "all clubs").
 */
export function getAdminClubIds(user: unknown): string[] {
  if (!user || typeof user !== 'object') return []
  const u = user as RBACUser
  if (u.role === 'superadmin') return []
  if (isOwnInstitutionAdmin(u)) return []

  const assignments = (u.roleAssignments || []) as RoleAssignment[]
  return assignments
    .filter((a) => a.assignedRole === 'club_admin' && a.scopeType === 'club')
    .map((a) => resolveScopeId(a.scopeId))
    .filter(Boolean) as string[]
}

/**
 * Payload access control: user can manage clubs they are admin of.
 * SuperAdmin can manage all. institution_admin can manage all within institution.
 * Club admins can manage only their assigned clubs.
 *
 * @example
 *   access: { update: clubAdminAccess }
 */
export const clubAdminAccess: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.role === 'superadmin') return true

  const userInstId = getUserInstitutionId(user)
  if (!userInstId) return false

  const institutionConstraint: Where = { institution: { equals: userInstId } }

  // institution_admin manages all clubs in their institution
  if (isOwnInstitutionAdmin(user)) return institutionConstraint

  // club_admin sees only their clubs within their institution
  if (checkPermission(user, 'club:edit_page')) {
    const clubIds = getAdminClubIds(user)
    if (clubIds.length === 0) return false
    return {
      and: [institutionConstraint, { id: { in: clubIds } }],
    } as Where
  }

  return false
}

/**
 * Payload access control: user can view clubs they belong to (any club role).
 * Institution-isolated.
 */
export const clubMemberAccess: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.role === 'superadmin') return true

  const userInstId = getUserInstitutionId(user)
  if (!userInstId) return false

  if (isOwnInstitutionAdmin(user)) {
    return { institution: { equals: userInstId } } as Where
  }

  return (
    checkPermission(user, 'club:edit_page') ||
    checkPermission(user, 'club:manage_members')
  )
}
