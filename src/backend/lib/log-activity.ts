import { getPayloadClient } from './payload-client'

type ActionType =
  | 'approve_post' | 'reject_post' | 'delete_post' | 'unpublish_post'
  | 'approve_comment' | 'reject_comment' | 'spam_comment' | 'comment_reported'
  | 'role_change' | 'user_action' | 'content_moderation'
  | 'newsletter_sent' | 'newsletter_scheduled' | 'newsletter_deleted'
  | 'digest_generated' | 'subscriber_imported' | 'subscriber_exported' | 'subscriber_status_changed'
  | 'template_created' | 'template_updated' | 'template_published' | 'template_unpublished' | 'template_deleted'

interface LogActivityParams {
  action: ActionType
  actorId?: string
  resourceType: 'posts' | 'comments' | 'users' | 'media' | 'newsletters' | 'newsletter-subscribers' | 'templates'
  resourceId: string
  resourceTitle?: string
  details?: string
  ipAddress?: string
}

export async function logActivity(params: LogActivityParams) {
  try {
    // Skip logging if no actor ID provided (required field)
    if (!params.actorId) return
    
    const payload = await getPayloadClient()
    await payload.create({
      collection: 'admin-logs',
      data: {
        action: params.action,
        resourceType: params.resourceType,
        resourceId: params.resourceId,
        user: params.actorId,
        details: params.details || params.resourceTitle || '',
        timestamp: new Date().toISOString(),
        ipAddress: params.ipAddress,
      },
      overrideAccess: true,
    })
  } catch (error) {
    console.error('Failed to log activity:', error)
  }
}
