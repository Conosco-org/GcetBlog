/**
 * Blog Access Helpers — Content Engine v2 RBAC (Multi-tenant Ready)
 *
 * Shortcut functions for checking blog-scoped permissions.
 * All checks are institution-isolated.
 * Replaces the old `contributorOwn.ts` pattern.
 */

import type { Access, Where } from 'payload'
import {
  checkPermission,
  getUserInstitutionId,
  isOwnInstitutionAdmin,
  type RBACUser,
} from './hasPermission'
import type { RoleAssignment } from './permissions'

/**
 * Check if user has blog_editor role (full blog access within institution).
 */
export function isBlogEditor(user: unknown): boolean {
  if (!user || typeof user !== 'object') return false
  const u = user as RBACUser
  if (u.role === 'superadmin') return true
  if (isOwnInstitutionAdmin(u)) return true

  const assignments = (u.roleAssignments || []) as RoleAssignment[]
  return assignments.some((a) => a.assignedRole === 'blog_editor')
}

/**
 * Check if user has blog_author role (own content only within institution).
 */
export function isBlogAuthor(user: unknown): boolean {
  if (!user || typeof user !== 'object') return false
  const u = user as RBACUser
  if (u.role === 'superadmin') return true
  if (isOwnInstitutionAdmin(u)) return true

  const assignments = (u.roleAssignments || []) as RoleAssignment[]
  return assignments.some((a) => a.assignedRole === 'blog_author')
}

/**
 * Check if user has any blog role (author or editor).
 */
export function hasBlogRole(user: unknown): boolean {
  return isBlogEditor(user) || isBlogAuthor(user)
}

/**
 * Payload access control for blog posts: institution-isolated.
 * blog_editors see all within institution, blog_authors see only their own.
 * Replaces old `contributorOwn` access.
 */
export const blogPostAccess: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.role === 'superadmin') return true

  const u = user as unknown as RBACUser
  const userInstId = getUserInstitutionId(u)
  if (!userInstId) return false

  const institutionConstraint: Where = { institution: { equals: userInstId } }

  // institution_admin sees all within institution
  if (isOwnInstitutionAdmin(u)) return institutionConstraint

  const assignments = (u.roleAssignments || []) as RoleAssignment[]

  // blog_editor sees all posts within institution
  if (assignments.some((a) => a.assignedRole === 'blog_editor')) {
    return institutionConstraint
  }

  // blog_author sees only their own within institution
  if (assignments.some((a) => a.assignedRole === 'blog_author')) {
    return {
      and: [institutionConstraint, { 'authors.id': { equals: u.id } }],
    } as Where
  }

  return false
}

/**
 * Payload access: user can create blog posts.
 * Both blog_editors and blog_authors can create.
 */
export const blogCreateAccess: Access = ({ req: { user } }) => {
  return checkPermission(user, 'blog:create_draft')
}

/**
 * Payload access: user can publish blog posts (change status to published).
 * Only blog_editors, institution_admins, and superadmins.
 */
export const blogPublishAccess: Access = ({ req: { user } }) => {
  return checkPermission(user, 'blog:publish')
}
