'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { revalidatePath } from 'next/cache'
import { getMeUser } from '@backend/lib/get-me-user' // TODO: This utility needs to be moved to shared

/**
 * Shared comment moderation actions
 * These functions can be used anywhere with proper permission checks
 */

interface ModerationResult {
  success: boolean
  message?: string
  error?: string
  results?: {
    success: number
    failed: number
    errors: Array<{ commentId: string; error: string }>
  }
}

/**
 * Approve comments - Editor only
 */
export async function approveComments(commentIds: string[]): Promise<ModerationResult> {
  const payload = await getPayload({ config })
  const { user } = await getMeUser()

  if (!user || user.role !== 'editor') {
    return { success: false, error: 'Unauthorized: Editor access required' }
  }

  const results = { success: 0, failed: 0, errors: [] as Array<{ commentId: string; error: string }> }

  for (const commentId of commentIds) {
    try {
      await payload.update({
        collection: 'comments',
        id: commentId,
        data: {
          status: 'approved',
          moderatedBy: user.id,
          moderatedAt: new Date().toISOString(),
        },
      })

      await payload.create({
        collection: 'admin-logs',
        data: {
          action: 'approve_comment',
          user: user.id,
          resourceType: 'comments',
          resourceId: commentId,
          timestamp: new Date().toISOString(),
        },
      })

      results.success++
    } catch (error) {
      results.failed++
      results.errors.push({
        commentId,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  revalidatePath('/editor/queue')
  revalidatePath('/editor/comments')

  return {
    success: true,
    message: `Approved ${results.success} comment(s)${results.failed > 0 ? `, ${results.failed} failed` : ''}`,
    results,
  }
}

/**
 * Reject comments - Editor only
 */
export async function rejectComments(
  commentIds: string[],
  reason: string,
  customReason?: string
): Promise<ModerationResult> {
  const payload = await getPayload({ config })
  const { user } = await getMeUser()

  if (!user || user.role !== 'editor') {
    return { success: false, error: 'Unauthorized: Editor access required' }
  }

  const results = { success: 0, failed: 0, errors: [] as Array<{ commentId: string; error: string }> }

  for (const commentId of commentIds) {
    try {
      await payload.update({
        collection: 'comments',
        id: commentId,
        data: {
          status: 'rejected',
          rejectionReason: reason as 'violates guidelines' | 'spam' | 'off-topic' | 'inappropriate language' | 'duplicate' | 'other',
          rejectionReasonCustom: reason === 'other' ? customReason : undefined,
          moderatedBy: user.id,
          moderatedAt: new Date().toISOString(),
        },
      })

      await payload.create({
        collection: 'admin-logs',
        data: {
          action: 'reject_comment',
          user: user.id,
          resourceType: 'comments',
          resourceId: commentId,
          timestamp: new Date().toISOString(),
          details: JSON.stringify({ reason, customReason }),
        },
      })

      results.success++
    } catch (error) {
      results.failed++
      results.errors.push({
        commentId,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  revalidatePath('/editor/queue')
  revalidatePath('/editor/comments')

  return {
    success: true,
    message: `Rejected ${results.success} comment(s)${results.failed > 0 ? `, ${results.failed} failed` : ''}`,
    results,
  }
}

/**
 * Mark comments as spam - Editor only
 */
export async function markAsSpam(commentIds: string[], spamType: string): Promise<ModerationResult> {
  const payload = await getPayload({ config })
  const { user } = await getMeUser()

  if (!user || user.role !== 'editor') {
    return { success: false, error: 'Unauthorized: Editor access required' }
  }

  const results = { success: 0, failed: 0, errors: [] as Array<{ commentId: string; error: string }> }

  for (const commentId of commentIds) {
    try {
      await payload.update({
        collection: 'comments',
        id: commentId,
        data: {
          status: 'spam',
          spamType: spamType as 'commercial' | 'malicious' | 'off-topic' | 'abusive' | 'bot-generated',
          moderatedBy: user.id,
          moderatedAt: new Date().toISOString(),
        },
      })

      await payload.create({
        collection: 'admin-logs',
        data: {
          action: 'spam_comment',
          user: user.id,
          resourceType: 'comments',
          resourceId: commentId,
          timestamp: new Date().toISOString(),
          details: JSON.stringify({ spamType }),
        },
      })

      results.success++
    } catch (error) {
      results.failed++
      results.errors.push({
        commentId,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  revalidatePath('/editor/queue')
  revalidatePath('/editor/comments')

  return {
    success: true,
    message: `Marked ${results.success} comment(s) as spam${results.failed > 0 ? `, ${results.failed} failed` : ''}`,
    results,
  }
}

/**
 * Delete comments permanently - Editor only
 */
export async function deleteComments(commentIds: string[]): Promise<ModerationResult> {
  const payload = await getPayload({ config })
  const { user } = await getMeUser()

  if (!user || user.role !== 'editor') {
    return { success: false, error: 'Unauthorized: Editor access required' }
  }

  const results = { success: 0, failed: 0, errors: [] as Array<{ commentId: string; error: string }> }

  for (const commentId of commentIds) {
    try {
      await payload.delete({
        collection: 'comments',
        id: commentId,
      })

      await payload.create({
        collection: 'admin-logs',
        data: {
          action: 'spam_comment',
          user: user.id,
          resourceType: 'comments',
          resourceId: commentId,
          timestamp: new Date().toISOString(),
        },
      })

      results.success++
    } catch (error) {
      results.failed++
      results.errors.push({
        commentId,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  revalidatePath('/editor/queue')
  revalidatePath('/editor/comments')

  return {
    success: true,
    message: `Deleted ${results.success} comment(s)${results.failed > 0 ? `, ${results.failed} failed` : ''}`,
    results,
  }
}

/**
 * Modify comment content - Editor only
 */
export async function modifyCommentContent(
  commentId: string,
  newContent: string,
  reason: string
): Promise<ModerationResult> {
  const payload = await getPayload({ config })
  const { user } = await getMeUser()

  if (!user || user.role !== 'editor') {
    return { success: false, error: 'Unauthorized: Editor access required' }
  }

  try {
    const comment = await payload.findByID({
      collection: 'comments',
      id: commentId,
    })

    const revisionHistory = comment.revisionHistory || []
    revisionHistory.push({
      originalContent: comment.content,
      modifiedBy: user.id,
      modifiedAt: new Date().toISOString(),
      reason,
    })

    await payload.update({
      collection: 'comments',
      id: commentId,
      data: {
        content: newContent,
        revisionHistory,
        contentModified: true,
      },
    })

    revalidatePath('/editor/queue')
    revalidatePath('/editor/comments')

    return { success: true, message: 'Comment modified successfully' }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to modify comment',
    }
  }
}

/**
 * Delete own comment - Comment author only (if not approved)
 */
export async function deleteOwnComment(commentId: string): Promise<ModerationResult> {
  const payload = await getPayload({ config })
  const { user } = await getMeUser()

  if (!user) {
    return { success: false, error: 'Unauthorized: Login required' }
  }

  try {
    const comment = await payload.findByID({
      collection: 'comments',
      id: commentId,
    })

    // Check if user is the author
    const authorId = typeof comment.author === 'object' && comment.author ? comment.author.id : comment.author
    if (!authorId || authorId !== user.id) {
      return { success: false, error: 'Unauthorized: You can only delete your own comments' }
    }

    // Check if comment is not approved
    if (comment.status === 'approved') {
      return { success: false, error: 'Cannot delete approved comments' }
    }

    await payload.delete({
      collection: 'comments',
      id: commentId,
    })

    revalidatePath('/dashboard/user/comments')

    return { success: true, message: 'Comment deleted successfully' }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete comment',
    }
  }
}
