/**
 * Core Permission Checker — Content Engine v2 RBAC (Multi-tenant Ready)
 *
 * Checks if a user has a specific permission, with institution isolation.
 *
 * Bypass hierarchy:
 *   1. superadmin → bypasses EVERYTHING (platform owner, invisible on college sites)
 *   2. institution_admin → bypasses all permission checks WITHIN their institution
 *   3. scoped roles → checked against PERMISSION_MAP
 *
 * Every check is institution-scoped: a blog_editor at College A cannot touch College B's data.
 */

import type { Access, Where } from 'payload'
import {
  PERMISSION_MAP,
  type Permission,
  type RoleAssignment,
  type AssignableRole,
  resolveScopeId,
  resolveInstitutionId,
} from './permissions'

// ---------------------------------------------------------------------------
// User type with RBAC + multi-tenant fields
// ---------------------------------------------------------------------------

export interface RBACUser {
  id: string
  role: 'superadmin' | 'user'
  institution?: string | { id: string; [key: string]: unknown }
  roleAssignments?: RoleAssignment[]
  [key: string]: unknown
}

/**
 * Safely cast an unknown user to RBACUser.
 * Returns null if user is not valid.
 */
function asRBACUser(user: unknown): RBACUser | null {
  if (!user || typeof user !== 'object') return null
  const u = user as Record<string, unknown>
  if (!u.id || !u.role) return null
  return u as unknown as RBACUser
}

/**
 * Get the user's institution ID (resolved from string or populated object).
 */
export function getUserInstitutionId(user: unknown): string | undefined {
  const rbacUser = asRBACUser(user)
  if (!rbacUser) return undefined
  return resolveInstitutionId(rbacUser.institution)
}

/**
 * Check if user is an institution_admin for a specific institution.
 */
export function isInstitutionAdmin(user: unknown, institutionId?: string): boolean {
  const rbacUser = asRBACUser(user)
  if (!rbacUser) return false
  if (rbacUser.role === 'superadmin') return true

  const assignments = rbacUser.roleAssignments || []
  return assignments.some((a) => {
    if (a.assignedRole !== 'institution_admin') return false
    if (!institutionId) return true // any institution_admin role counts

    const scopeId = resolveScopeId(a.scopeId)

    // If scopeId is set, it must match exactly
    if (scopeId) return scopeId === institutionId

    // If scopeId is NOT set, the role applies to the user's own institution
    // (legacy assignments and new assignments both may omit scopeId)
    const userInstId = resolveInstitutionId(rbacUser.institution)
    return userInstId === institutionId
  })
}

/**
 * Check if user is an institution_admin for THEIR OWN institution.
 */
export function isOwnInstitutionAdmin(user: unknown): boolean {
  const rbacUser = asRBACUser(user)
  if (!rbacUser) return false
  const userInstId = resolveInstitutionId(rbacUser.institution)
  if (!userInstId) return false
  return isInstitutionAdmin(user, userInstId)
}

// ---------------------------------------------------------------------------
// Core: Check if user has a specific permission
// ---------------------------------------------------------------------------

/**
 * Check if a user has a permission (optionally scoped to a specific club).
 * Returns true/false. Does NOT return Payload WHERE constraints.
 *
 * Handles bypass hierarchy:
 *   superadmin → always true
 *   institution_admin → true if within their institution
 *   scoped role → true if permission+scope match
 *
 * @param user - The authenticated user
 * @param permission - Permission key from PERMISSION_MAP
 * @param scopeId - Optional: specific club ID to check against
 */
export function checkPermission(
  user: unknown,
  permission: Permission,
  scopeId?: string,
): boolean {
  const rbacUser = asRBACUser(user)
  if (!rbacUser) return false

  // SuperAdmin bypasses all checks (platform owner)
  if (rbacUser.role === 'superadmin') return true

  const assignments = rbacUser.roleAssignments || []

  // institution_admin bypasses all permission checks within their institution
  if (isOwnInstitutionAdmin(rbacUser)) return true

  const allowedRoles = PERMISSION_MAP[permission] as readonly AssignableRole[]

  return assignments.some((assignment) => {
    // Role must be in the allowed list for this permission
    if (!allowedRoles.includes(assignment.assignedRole)) return false

    // If we need a specific club scope, verify it matches
    if (scopeId && assignment.scopeType === 'club') {
      const assignedScopeId = resolveScopeId(assignment.scopeId)
      return assignedScopeId === scopeId
    }

    // Global, blog, and institution-scoped roles don't need scopeId matching
    return true
  })
}

// ---------------------------------------------------------------------------
// Payload Access: Simple permission gate (boolean)
// ---------------------------------------------------------------------------

/**
 * Payload access control function: returns true/false based on permission.
 * Use for create/delete operations where you just need a yes/no gate.
 *
 * @example
 *   access: { create: hasPermission('event:create') }
 */
export function hasPermission(permission: Permission): Access {
  return ({ req: { user } }) => {
    return checkPermission(user, permission)
  }
}

// ---------------------------------------------------------------------------
// Payload Access: Permission with institution + club-scoped filtering
// ---------------------------------------------------------------------------

/**
 * Payload access that returns a WHERE constraint for institution/club-scoped data.
 * Ensures data isolation: users only see their own institution's data.
 *
 * SuperAdmin sees all institutions.
 * institution_admin sees all data within their institution.
 * Club-scoped users see only their club's data within their institution.
 *
 * @param permission - The permission to check
 * @param clubField - The field name for club reference (e.g., 'organizingClubs')
 * @param institutionField - The field name for institution reference (default: 'institution')
 */
export function hasPermissionFilter(
  permission: Permission,
  clubField: string = 'organizingClubs',
  institutionField: string = 'institution',
): Access {
  return ({ req: { user } }) => {
    const rbacUser = asRBACUser(user)
    if (!rbacUser) return false

    // SuperAdmin sees everything across all institutions
    if (rbacUser.role === 'superadmin') return true

    const userInstId = resolveInstitutionId(rbacUser.institution)
    if (!userInstId) return false

    // Base constraint: always filter to user's institution
    const institutionConstraint: Where = {
      [institutionField]: { equals: userInstId },
    }

    // institution_admin sees ALL data within their institution
    if (isOwnInstitutionAdmin(rbacUser)) return institutionConstraint

    const assignments = rbacUser.roleAssignments || []
    const allowedRoles = PERMISSION_MAP[permission] as readonly AssignableRole[]

    const matchingAssignments = assignments.filter((a) =>
      allowedRoles.includes(a.assignedRole),
    )

    if (matchingAssignments.length === 0) return false

    // If any matching assignment is global, blog, or institution-scoped, allow all within institution
    if (
      matchingAssignments.some(
        (a) => a.scopeType === 'global' || a.scopeType === 'blog' || a.scopeType === 'institution',
      )
    ) {
      return institutionConstraint
    }

    // Club-scoped: filter to their assigned clubs within their institution
    const clubIds = matchingAssignments
      .filter((a) => a.scopeType === 'club')
      .map((a) => resolveScopeId(a.scopeId))
      .filter(Boolean) as string[]

    if (clubIds.length === 0) return false

    return {
      and: [institutionConstraint, { [clubField]: { in: clubIds } }],
    } as Where
  }
}

// ---------------------------------------------------------------------------
// Payload Access: Blog content with owner filtering + institution isolation
// ---------------------------------------------------------------------------

/**
 * Blog content access: institution-isolated. blog_editors see all within institution,
 * blog_authors see only their own.
 *
 * @example
 *   access: { update: blogContentAccess('blog:edit_own') }
 */
export function blogContentAccess(
  permission: Permission,
  institutionField: string = 'institution',
): Access {
  return ({ req: { user } }) => {
    const rbacUser = asRBACUser(user)
    if (!rbacUser) return false

    // SuperAdmin sees everything
    if (rbacUser.role === 'superadmin') return true

    const userInstId = resolveInstitutionId(rbacUser.institution)
    if (!userInstId) return false

    const institutionConstraint: Where = {
      [institutionField]: { equals: userInstId },
    }

    // institution_admin sees all within institution
    if (isOwnInstitutionAdmin(rbacUser)) return institutionConstraint

    const assignments = rbacUser.roleAssignments || []
    const allowedRoles = PERMISSION_MAP[permission] as readonly AssignableRole[]

    const matchingAssignments = assignments.filter((a) =>
      allowedRoles.includes(a.assignedRole),
    )

    if (matchingAssignments.length === 0) return false

    // blog_editor sees all posts within institution
    if (matchingAssignments.some((a) => a.assignedRole === 'blog_editor')) {
      return institutionConstraint
    }

    // blog_author sees only their own posts within institution
    return {
      and: [institutionConstraint, { 'authors.id': { equals: rbacUser.id } }],
    } as Where
  }
}

// ---------------------------------------------------------------------------
// Payload Access: Public read with institution filtering
// ---------------------------------------------------------------------------

/**
 * Public content: read by anyone BUT institution-isolated.
 * Authenticated users see drafts within their institution.
 * Anonymous users see published content from any institution.
 *
 * Note: For truly public pages (college landing page), no institution filter needed.
 * For content listings (blog archive), the route determines the institution context.
 */
export function publicOrInstitution(institutionField: string = 'institution'): Access {
  return ({ req: { user } }) => {
    // Unauthenticated: see all published content
    if (!user) {
      return { _status: { equals: 'published' } }
    }

    const rbacUser = asRBACUser(user)
    if (!rbacUser) return { _status: { equals: 'published' } }

    // SuperAdmin sees everything
    if (rbacUser.role === 'superadmin') return true

    const userInstId = resolveInstitutionId(rbacUser.institution)
    if (!userInstId) return { _status: { equals: 'published' } }

    // Authenticated users see their institution's content (including drafts if they have access)
    // Non-draft content from other institutions is also visible
    return {
      or: [
        { [institutionField]: { equals: userInstId } },
        { _status: { equals: 'published' } },
      ],
    } as Where
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Get all club IDs the user has access to (from their role assignments).
 * Returns empty array for superadmin/institution_admin (meaning "all").
 */
export function getUserClubIds(user: unknown): string[] {
  const rbacUser = asRBACUser(user)
  if (!rbacUser) return []

  if (rbacUser.role === 'superadmin') return []
  if (isOwnInstitutionAdmin(rbacUser)) return []

  const assignments = rbacUser.roleAssignments || []
  return assignments
    .filter((a) => a.scopeType === 'club')
    .map((a) => resolveScopeId(a.scopeId))
    .filter(Boolean) as string[]
}

/**
 * Check if user is a superadmin (platform owner).
 */
export function isSuperAdminCheck(user: unknown): boolean {
  const rbacUser = asRBACUser(user)
  return rbacUser?.role === 'superadmin'
}

/**
 * Check if user has ANY role assignment (not just a base user with no permissions).
 */
export function hasAnyAssignment(user: unknown): boolean {
  const rbacUser = asRBACUser(user)
  if (!rbacUser) return false
  if (rbacUser.role === 'superadmin') return true
  return (rbacUser.roleAssignments || []).length > 0
}
