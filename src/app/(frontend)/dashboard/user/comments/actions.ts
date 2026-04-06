'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { revalidatePath } from 'next/cache'
import { getMeUser } from '@/utilities/getMeUser'

/**
 * Delete own comment action
 * Validates: Requirements 5.1, 5.2, 5.3, 9.6
 */
export async function deleteOwnComment(formData: FormData) {
  const payload = await getPayload({ config })

  // Validate user is authenticated
  const { user } = await getMeUser()

  if (!user) {
    return { error: 'You must be logged in to delete comments' }
  }

  // Parse input parameters
  const commentId = formData.get('commentId') as string

  if (!commentId) {
    return { error: 'Comment ID is required' }
  }

  try {
    // Fetch the comment
    const comment = await payload.findByID({
      collection: 'comments',
      id: commentId,
    })

    if (!comment) {
      return { error: 'Comment not found' }
    }

    // Validate user is comment author
    const authorId = typeof comment.author === 'object' && comment.author ? comment.author.id : comment.author

    if (!authorId || authorId !== user.id) {
      return { error: 'You can only delete your own comments' }
    }

    // Validate comment status is not approved
    if (comment.status === 'approved') {
      return { error: 'Cannot delete approved comments' }
    }

    // Delete comment from database
    await payload.delete({
      collection: 'comments',
      id: commentId,
    })

    // Revalidate user dashboard path
    revalidatePath('/dashboard/user/comments')

    return { success: true, message: 'Comment deleted successfully' }
  } catch (error) {
    console.error('Error deleting comment:', error)
    return { error: error instanceof Error ? error.message : 'Failed to delete comment' }
  }
}

/**
 * Report comment action
 * Allows users to report inappropriate comments
 */
export async function reportComment(formData: FormData) {
  const payload = await getPayload({ config })

  // Validate user is authenticated
  const { user } = await getMeUser()

  if (!user) {
    return { error: 'You must be logged in to report comments' }
  }

  // Parse input parameters
  const commentId = formData.get('commentId') as string
  const reason = formData.get('reason') as string

  if (!commentId) {
    return { error: 'Comment ID is required' }
  }

  if (!reason || reason.trim().length < 10) {
    return { error: 'Please provide a detailed reason (at least 10 characters)' }
  }

  try {
    // Fetch the comment
    const comment = await payload.findByID({
      collection: 'comments',
      id: commentId,
    })

    if (!comment) {
      return { error: 'Comment not found' }
    }

    // Check if already reported by this user
    const reportedById = typeof comment.reportedBy === 'object' && comment.reportedBy ? comment.reportedBy.id : comment.reportedBy

    if (reportedById === user.id) {
      return { error: 'You have already reported this comment' }
    }

    // Update comment with report information
    await payload.update({
      collection: 'comments',
      id: commentId,
      data: {
        reportedBy: user.id,
        reportReason: reason,
        reportedAt: new Date().toISOString(),
      },
    })

    // Revalidate paths
    revalidatePath('/dashboard/user/comments')
    revalidatePath('/editor/content')

    return { success: true, message: 'Comment reported successfully' }
  } catch (error) {
    console.error('Error reporting comment:', error)
    return { error: error instanceof Error ? error.message : 'Failed to report comment' }
  }
}
