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
