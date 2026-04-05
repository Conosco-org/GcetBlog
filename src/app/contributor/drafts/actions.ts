'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function markNotificationAsRead(notificationId: string) {
  try {
    const payload = await getPayload({ config: configPromise })
    const requestHeaders = await headers()

    // Authenticate the request
    const { user } = await payload.auth({ headers: requestHeaders })

    if (!user) {
      throw new Error('Authentication required')
    }

    // Get the notification to verify ownership
    const notification = await payload.findByID({
      collection: 'rejection-notifications',
      id: notificationId,
    })

    if (!notification) {
      throw new Error('Notification not found')
    }

    // Check if user is the contributor or an editor/admin
    const userRole = (user as { role: string }).role
    const contributorId = typeof notification.contributor === 'string' 
      ? notification.contributor 
      : notification.contributor?.id

    if (userRole !== 'editor' && userRole !== 'admin' && user.id !== contributorId) {
      throw new Error('You do not have permission to mark this notification as read')
    }

    // Update the notification to mark as read
    await payload.update({
      collection: 'rejection-notifications',
      id: notificationId,
      data: {
        isRead: true,
      },
    })

    // Revalidate the drafts page
    revalidatePath('/contributor/drafts')

    return { success: true, message: 'Notification marked as read' }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to mark notification as read',
    }
  }
}
