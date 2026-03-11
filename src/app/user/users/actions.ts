'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { isSuperAdmin, isInstitutionAdmin } from '@/utilities/checkUserRole'
import {
  INSTITUTION_ASSIGNABLE_ROLES,
  ROLE_LABELS,
  type AssignableRole,
} from '@/access/permissions'

type RoleAssignment = {
  assignedRole: string
  scopeType: string
  scopeId?: string | { id: string }
  scopeLabel?: string
  id?: string | null
}

type UserWithRoles = {
  id: string
  role?: string
  institution?: string | { id: string }
  roleAssignments?: RoleAssignment[]
  [key: string]: unknown
}

/**
 * Resolve institution ID from user.institution (string or populated object)
 */
function resolveInstId(inst: string | { id: string } | undefined | null): string | undefined {
  if (!inst) return undefined
  if (typeof inst === 'string') return inst
  if (typeof inst === 'object' && 'id' in inst) return inst.id
  return undefined
}

// ---------------------------------------------------------------------------
// Assign a role to a user
// ---------------------------------------------------------------------------
export async function assignRole(
  userId: string,
  assignment: {
    assignedRole: string
    scopeType: string
    scopeId?: string
    scopeLabel?: string
  },
) {
  try {
    const payload = await getPayload({ config: configPromise })
    const requestHeaders = await headers()
    const { user } = await payload.auth({ headers: requestHeaders })

    if (!user) return { success: false, message: 'Unauthorized' }

    const fullUser = (await payload.findByID({
      collection: 'users',
      id: user.id,
      depth: 0,
    })) as unknown as UserWithRoles

    const actorIsSuperAdmin = isSuperAdmin(fullUser)
    const actorIsInstAdmin = isInstitutionAdmin(fullUser)

    if (!actorIsSuperAdmin && !actorIsInstAdmin) {
      return { success: false, message: 'Unauthorized — admin access required' }
    }

    // institution_admin can only be assigned by superadmin
    if (assignment.assignedRole === 'institution_admin' && !actorIsSuperAdmin) {
      return { success: false, message: 'Only superadmins can assign Institution Admin' }
    }

    // Inst admins can only assign roles from INSTITUTION_ASSIGNABLE_ROLES
    if (
      !actorIsSuperAdmin &&
      !(INSTITUTION_ASSIGNABLE_ROLES as readonly string[]).includes(assignment.assignedRole)
    ) {
      return { success: false, message: 'You cannot assign this role' }
    }

    if (user.id === userId) {
      return { success: false, message: 'You cannot change your own roles' }
    }

    // Fetch target user
    const targetUser = (await payload.findByID({
      collection: 'users',
      id: userId,
      depth: 0,
    })) as unknown as UserWithRoles

    if (targetUser.role === 'superadmin') {
      return { success: false, message: 'Cannot modify superadmin roles' }
    }

    // Institution scoping: inst_admin can only manage users within their own institution
    if (!actorIsSuperAdmin) {
      const actorInstId = resolveInstId(fullUser.institution)
      const targetInstId = resolveInstId(targetUser.institution)
      if (!actorInstId || actorInstId !== targetInstId) {
        return { success: false, message: 'User is not in your institution' }
      }
    }

    const currentAssignments = (targetUser.roleAssignments || []) as RoleAssignment[]

    // Check for duplicate (same role + same scopeId)
    const isDuplicate = currentAssignments.some((a) => {
      if (a.assignedRole !== assignment.assignedRole) return false
      const existingScopeId =
        typeof a.scopeId === 'string'
          ? a.scopeId
          : a.scopeId && typeof a.scopeId === 'object' && 'id' in a.scopeId
            ? a.scopeId.id
            : undefined
      return existingScopeId === (assignment.scopeId || undefined)
    })

    if (isDuplicate) {
      const label = ROLE_LABELS[assignment.assignedRole as AssignableRole] || assignment.assignedRole
      return { success: false, message: `User already has ${label}${assignment.scopeLabel ? ` for ${assignment.scopeLabel}` : ''}` }
    }

    const newAssignment: RoleAssignment = {
      assignedRole: assignment.assignedRole,
      scopeType: assignment.scopeType,
      ...(assignment.scopeId && { scopeId: assignment.scopeId }),
      ...(assignment.scopeLabel && { scopeLabel: assignment.scopeLabel }),
    }

    await payload.update({
      collection: 'users',
      id: userId,
      data: {
        roleAssignments: [...currentAssignments, newAssignment],
      } as any,
      overrideAccess: true,
    })

    // Audit log
    try {
      await payload.create({
        collection: 'admin-logs',
        data: {
          user: user.id,
          action: 'role_change',
          resourceType: 'users',
          resourceId: userId,
          details: `Assigned ${assignment.assignedRole}${assignment.scopeLabel ? ` (${assignment.scopeLabel})` : ''}`,
          timestamp: new Date().toISOString(),
        },
      })
    } catch {
      // audit log collection may not exist
    }

    revalidatePath('/user/users')
    const label = ROLE_LABELS[assignment.assignedRole as AssignableRole] || assignment.assignedRole
    return { success: true, message: `${label} assigned successfully` }
  } catch (error) {
    console.error('Error assigning role:', error)
    return { success: false, message: 'Failed to assign role' }
  }
}

// ---------------------------------------------------------------------------
// Remove a role assignment by its array-item ID
// ---------------------------------------------------------------------------
export async function removeRole(userId: string, assignmentId: string) {
  try {
    const payload = await getPayload({ config: configPromise })
    const requestHeaders = await headers()
    const { user } = await payload.auth({ headers: requestHeaders })

    if (!user) return { success: false, message: 'Unauthorized' }

    const fullUser = (await payload.findByID({
      collection: 'users',
      id: user.id,
      depth: 0,
    })) as unknown as UserWithRoles

    const actorIsSuperAdmin = isSuperAdmin(fullUser)
    const actorIsInstAdmin = isInstitutionAdmin(fullUser)

    if (!actorIsSuperAdmin && !actorIsInstAdmin) {
      return { success: false, message: 'Unauthorized — admin access required' }
    }

    if (user.id === userId) {
      return { success: false, message: 'You cannot change your own roles' }
    }

    const targetUser = (await payload.findByID({
      collection: 'users',
      id: userId,
      depth: 0,
    })) as unknown as UserWithRoles

    if (targetUser.role === 'superadmin') {
      return { success: false, message: 'Cannot modify superadmin roles' }
    }

    // Institution scoping
    if (!actorIsSuperAdmin) {
      const actorInstId = resolveInstId(fullUser.institution)
      const targetInstId = resolveInstId(targetUser.institution)
      if (!actorInstId || actorInstId !== targetInstId) {
        return { success: false, message: 'User is not in your institution' }
      }
    }

    const currentAssignments = (targetUser.roleAssignments || []) as RoleAssignment[]
    const assignmentToRemove = currentAssignments.find((a) => a.id === assignmentId)

    if (!assignmentToRemove) {
      return { success: false, message: 'Role assignment not found' }
    }

    // Only superadmin can remove institution_admin
    if (assignmentToRemove.assignedRole === 'institution_admin' && !actorIsSuperAdmin) {
      return { success: false, message: 'Only superadmins can remove Institution Admin' }
    }

    const newAssignments = currentAssignments.filter((a) => a.id !== assignmentId)

    await payload.update({
      collection: 'users',
      id: userId,
      data: { roleAssignments: newAssignments } as any,
      overrideAccess: true,
    })

    // Audit log
    try {
      await payload.create({
        collection: 'admin-logs',
        data: {
          user: user.id,
          action: 'role_change',
          resourceType: 'users',
          resourceId: userId,
          details: `Removed ${assignmentToRemove.assignedRole}${assignmentToRemove.scopeLabel ? ` (${assignmentToRemove.scopeLabel})` : ''}`,
          timestamp: new Date().toISOString(),
        },
      })
    } catch {
      // audit log collection may not exist
    }

    revalidatePath('/user/users')
    const label =
      ROLE_LABELS[assignmentToRemove.assignedRole as AssignableRole] ||
      assignmentToRemove.assignedRole
    return { success: true, message: `${label} removed` }
  } catch (error) {
    console.error('Error removing role:', error)
    return { success: false, message: 'Failed to remove role' }
  }
}

// ---------------------------------------------------------------------------
// Fetch clubs belonging to the current user's institution
// ---------------------------------------------------------------------------
export async function fetchClubsForInstitution() {
  try {
    const payload = await getPayload({ config: configPromise })
    const requestHeaders = await headers()
    const { user } = await payload.auth({ headers: requestHeaders })

    if (!user) return { success: false, message: 'Unauthorized', clubs: [] }

    const fullUser = (await payload.findByID({
      collection: 'users',
      id: user.id,
      depth: 0,
    })) as unknown as UserWithRoles

    const instId = resolveInstId(fullUser.institution)

    // If superadmin with no institution, get all clubs
    const where = instId
      ? { institution: { equals: instId } }
      : undefined

    const clubs = await payload.find({
      collection: 'clubs',
      where,
      limit: 100,
      sort: 'title',
      depth: 0,
    })

    return {
      success: true,
      clubs: clubs.docs.map((c: any) => ({ id: c.id, title: c.title })),
    }
  } catch (error) {
    console.error('Error fetching clubs:', error)
    return { success: false, message: 'Failed to fetch clubs', clubs: [] }
  }
}

// ---------------------------------------------------------------------------
// Legacy: simple role toggle (kept for backwards compatibility)
// ---------------------------------------------------------------------------
export async function changeUserRole(userId: string, assignedRole: string, action: 'add' | 'remove' = 'add') {
  // Delegate to the proper assignRole / removeRole
  if (action === 'add') {
    return assignRole(userId, {
      assignedRole,
      scopeType: assignedRole === 'institution_admin' ? 'institution' : 'institution',
    })
  }

  // For removal, we need to find the assignment ID
  try {
    const payload = await getPayload({ config: configPromise })
    const targetUser = (await payload.findByID({
      collection: 'users',
      id: userId,
      depth: 0,
    })) as unknown as UserWithRoles

    const assignment = (targetUser.roleAssignments || []).find(
      (a) => a.assignedRole === assignedRole,
    )
    if (!assignment?.id) {
      return { success: false, message: 'Role assignment not found' }
    }
    return removeRole(userId, assignment.id)
  } catch {
    return { success: false, message: 'Failed to remove role' }
  }
}

export async function deleteUser(userId: string) {
  try {
    const payload = await getPayload({ config: configPromise })
    const requestHeaders = await headers()
    const { user } = await payload.auth({ headers: requestHeaders })

    if (!user) {
      return { success: false, message: 'Unauthorized' }
    }

    // Fetch full user to check permissions
    const fullUser = await payload.findByID({
      collection: 'users',
      id: user.id,
      depth: 0,
    }) as unknown as UserWithRoles

    if (!isSuperAdmin(fullUser) && !isInstitutionAdmin(fullUser)) {
      return { success: false, message: 'Unauthorized' }
    }

    // Prevent deleting own account
    if (user.id === userId) {
      return { success: false, message: 'You cannot delete your own account' }
    }

    // Prevent deleting superadmins
    const targetUser = await payload.findByID({
      collection: 'users',
      id: userId,
      depth: 0,
    }) as unknown as UserWithRoles

    if (isSuperAdmin(targetUser)) {
      return { success: false, message: 'Cannot delete a superadmin' }
    }

    await payload.delete({
      collection: 'users',
      id: userId,
    })

    // Log the action
    await payload.create({
      collection: 'admin-logs',
      data: {
        user: user.id,
        action: 'user_action',
        resourceType: 'users',
        resourceId: userId,
        timestamp: new Date().toISOString(),
      },
    })

    revalidatePath('/user/users')
    return { success: true, message: 'User deleted successfully' }
  } catch (error) {
    console.error('Error deleting user:', error)
    return { success: false, message: 'Failed to delete user' }
  }
}

export async function toggleAdminStatus(userId: string) {
  try {
    const payload = await getPayload({ config: configPromise })
    const requestHeaders = await headers()
    const { user } = await payload.auth({ headers: requestHeaders })

    if (!user) {
      return { success: false, message: 'Unauthorized' }
    }

    // Only superadmins can toggle institution_admin
    const fullUser = await payload.findByID({
      collection: 'users',
      id: user.id,
      depth: 0,
    }) as unknown as UserWithRoles

    if (!isSuperAdmin(fullUser)) {
      return { success: false, message: 'Only superadmins can toggle admin status' }
    }

    // Prevent toggling own admin status
    if (user.id === userId) {
      return { success: false, message: 'You cannot change your own admin status' }
    }

    // Fetch target user
    const targetUser = await payload.findByID({
      collection: 'users',
      id: userId,
      depth: 0,
    }) as unknown as UserWithRoles

    const currentAssignments = (targetUser.roleAssignments || []) as RoleAssignment[]
    const hasInstAdmin = currentAssignments.some(a => a.assignedRole === 'institution_admin')

    let newAssignments: RoleAssignment[]
    if (hasInstAdmin) {
      // Remove institution_admin
      newAssignments = currentAssignments.filter(a => a.assignedRole !== 'institution_admin')
    } else {
      // Add institution_admin
      newAssignments = [...currentAssignments, {
        assignedRole: 'institution_admin',
        scopeType: 'institution',
      }]
    }

    await payload.update({
      collection: 'users',
      id: userId,
      data: { roleAssignments: newAssignments } as any,
    })

    // Log the action
    await payload.create({
      collection: 'admin-logs',
      data: {
        user: user.id,
        action: 'user_action',
        resourceType: 'users',
        resourceId: userId,
        timestamp: new Date().toISOString(),
      },
    })

    revalidatePath('/user/users')
    return {
      success: true,
      message: hasInstAdmin
        ? 'User demoted from institution admin'
        : 'User promoted to institution admin',
    }
  } catch (error) {
    console.error('Error toggling admin status:', error)
    return { success: false, message: 'Failed to update admin status' }
  }
}

export async function toggleCanManageAdmins(userId: string) {
  // In the new RBAC system, "super admin" = superadmin base role.
  // Only an existing superadmin can promote/demote base role.
  try {
    const payload = await getPayload({ config: configPromise })
    const requestHeaders = await headers()
    const { user } = await payload.auth({ headers: requestHeaders })

    if (!user) {
      return { success: false, message: 'Unauthorized' }
    }

    const fullUser = await payload.findByID({
      collection: 'users',
      id: user.id,
      depth: 0,
    }) as unknown as UserWithRoles

    if (!isSuperAdmin(fullUser)) {
      return { success: false, message: 'Only superadmins can manage superadmin status' }
    }

    if (user.id === userId) {
      return { success: false, message: 'You cannot change your own superadmin status' }
    }

    const targetUser = await payload.findByID({
      collection: 'users',
      id: userId,
      depth: 0,
    }) as unknown as UserWithRoles

    const newRole = targetUser.role === 'superadmin' ? 'user' : 'superadmin'

    await payload.update({
      collection: 'users',
      id: userId,
      data: { role: newRole } as any,
    })

    // Log the action
    await payload.create({
      collection: 'admin-logs',
      data: {
        user: user.id,
        action: 'user_action',
        resourceType: 'users',
        resourceId: userId,
        timestamp: new Date().toISOString(),
      },
    })

    revalidatePath('/user/users')
    return {
      success: true,
      message: newRole === 'superadmin'
        ? 'User promoted to superadmin'
        : 'User demoted from superadmin',
    }
  } catch (error) {
    console.error('Error toggling superadmin:', error)
    return { success: false, message: 'Failed to update superadmin status' }
  }
}
