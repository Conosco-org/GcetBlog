'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { isSuperAdmin, isInstitutionAdmin } from '@/utilities/checkUserRole'

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
  roleAssignments?: RoleAssignment[]
  [key: string]: unknown
}

export async function changeUserRole(userId: string, assignedRole: string, action: 'add' | 'remove' = 'add') {
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

    // Prevent changing own role
    if (user.id === userId) {
      return { success: false, message: 'You cannot change your own role' }
    }

    // Fetch target user
    const targetUser = await payload.findByID({
      collection: 'users',
      id: userId,
      depth: 0,
    }) as unknown as UserWithRoles

    const currentAssignments = (targetUser.roleAssignments || []) as RoleAssignment[]

    let newAssignments: RoleAssignment[]
    if (action === 'remove') {
      newAssignments = currentAssignments.filter(a => a.assignedRole !== assignedRole)
    } else {
      // Don't add duplicate
      if (currentAssignments.some(a => a.assignedRole === assignedRole)) {
        return { success: false, message: `User already has role ${assignedRole}` }
      }
      newAssignments = [...currentAssignments, {
        assignedRole,
        scopeType: assignedRole === 'institution_admin' ? 'institution' : 'global',
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
        action: 'role_change',
        resourceType: 'users',
        resourceId: userId,
        timestamp: new Date().toISOString(),
      },
    })

    revalidatePath('/admin-dashboard/users')
    return { success: true, message: action === 'remove' ? `Role ${assignedRole} removed` : `Role ${assignedRole} assigned` }
  } catch (error) {
    console.error('Error changing user role:', error)
    return { success: false, message: 'Failed to update user role' }
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

    revalidatePath('/admin-dashboard/users')
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

    revalidatePath('/admin-dashboard/users')
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

    revalidatePath('/admin-dashboard/users')
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
