import { getPayloadClient } from './payload-client'

interface CreateNotificationParams {
  recipientId: string
  type: 'post_approved' | 'post_rejected' | 'feedback_received' | 'comment_replied' | 'post_commented' | 'comment_flagged' | 'role_changed'
  title: string
  message?: string
  link?: string
  relatedPostId?: string
  relatedCommentId?: string
  triggeredById?: string
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    const payload = await getPayloadClient()
    await payload.create({
      collection: 'notifications',
      data: {
        recipient: params.recipientId,
        type: params.type,
        title: params.title,
        message: params.message,
        link: params.link,
        relatedPost: params.relatedPostId,
        relatedComment: params.relatedCommentId,
        triggeredBy: params.triggeredById,
        isRead: false,
      },
      overrideAccess: true,
    })
  } catch (error) {
    // Never let notification failure break the main flow
    console.error('Failed to create notification:', error)
  }
}
