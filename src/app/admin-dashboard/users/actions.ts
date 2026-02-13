'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function changeUserRole(userId: string, newRole: 'contributor' | 'editor') {
  try {
    const payload = await getPayload({ config: configPromise })
    const requestHeaders = await headers()
    const { user } = await payload.auth({ headers: requestHeaders })

    if (!user) {
      return { success: false, message: 'Unauthorized' }
    }

    // Fetch full user to check isAdmin
    const fullUser = await payload.findByID({
      collection: 'users',
      id: user.id,
      depth: 0,
    })

    if (!fullUser.isAdmin) {
      return { success: false, message: 'Unauthorized' }
    }

    // Prevent changing own role
    if (user.id === userId) {
      return { success: false, message: 'You cannot change your own role' }
    }

    await payload.update({
      collection: 'users',
      id: userId,
      data: { role: newRole },
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
    return { success: true, message: `User role updated to ${newRole}` }
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

    // Fetch full user to check isAdmin
    const fullUser = await payload.findByID({
      collection: 'users',
      id: user.id,
      depth: 0,
    })

    if (!fullUser.isAdmin) {
      return { success: false, message: 'Unauthorized' }
    }

    // Prevent deleting own account
    if (user.id === userId) {
      return { success: false, message: 'You cannot delete your own account' }
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

    // Fetch full current user to check canManageAdmins
    const fullUser = await payload.findByID({
      collection: 'users',
      id: user.id,
      depth: 0,
    })

    if (!fullUser.canManageAdmins) {
      return { success: false, message: 'Only super admins can toggle admin status' }
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
    })

    // Only editors can be admins
    if (targetUser.role !== 'editor') {
      return { success: false, message: 'User must be an editor to become admin' }
    }

    const newStatus = !targetUser.isAdmin

    await payload.update({
      collection: 'users',
      id: userId,
      data: {
        isAdmin: newStatus,
        // If revoking admin, also revoke canManageAdmins
        ...(newStatus === false ? { canManageAdmins: false } : {}),
      },
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
      message: newStatus
        ? `User promoted to admin`
        : `User demoted from admin`,
    }
  } catch (error) {
    console.error('Error toggling admin status:', error)
    return { success: false, message: 'Failed to update admin status' }
  }
}

export async function toggleCanManageAdmins(userId: string) {
  try {
    const payload = await getPayload({ config: configPromise })
    const requestHeaders = await headers()
    const { user } = await payload.auth({ headers: requestHeaders })

    if (!user) {
      return { success: false, message: 'Unauthorized' }
    }

    // Fetch full current user to check canManageAdmins
    const fullUser = await payload.findByID({
      collection: 'users',
      id: user.id,
      depth: 0,
    })

    if (!fullUser.canManageAdmins) {
      return { success: false, message: 'Only super admins can manage super admin status' }
    }

    // Prevent toggling own super admin status
    if (user.id === userId) {
      return { success: false, message: 'You cannot change your own super admin status' }
    }

    // Fetch target user
    const targetUser = await payload.findByID({
      collection: 'users',
      id: userId,
      depth: 0,
    })

    // Must be an admin to become super admin
    if (!targetUser.isAdmin) {
      return { success: false, message: 'User must be an admin to become super admin' }
    }

    const newStatus = !targetUser.canManageAdmins

    await payload.update({
      collection: 'users',
      id: userId,
      data: { canManageAdmins: newStatus },
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
      message: newStatus
        ? `User granted super admin privileges`
        : `User revoked super admin privileges`,
    }
  } catch (error) {
    console.error('Error toggling canManageAdmins:', error)
    return { success: false, message: 'Failed to update super admin status' }
  }
}
