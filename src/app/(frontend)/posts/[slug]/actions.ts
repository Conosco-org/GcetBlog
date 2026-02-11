'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { revalidatePath } from 'next/cache'
import { getMeUser } from '@/utilities/getMeUser'

export async function submitComment(formData: FormData) {
  const payload = await getPayload({ config })

  const postId = formData.get('postId') as string
  const content = formData.get('content') as string
  const authorName = formData.get('authorName') as string
  const authorEmail = formData.get('authorEmail') as string

  if (!postId || !content || !authorName || !authorEmail) {
    return { error: 'All fields are required' }
  }

  try {
    // Check if the post exists
    const post = await payload.findByID({
      collection: 'posts',
      id: postId,
    })

    if (!post || post._status !== 'published') {
      return { error: 'Post not found or not published' }
    }

    // Create the comment
    await payload.create({
      collection: 'comments',
      data: {
        post: postId,
        content,
        authorName,
        authorEmail,
        status: 'pending', // All comments start as pending
        ipAddress: 'server', // Will be handled by middleware in production
        userAgent: 'server',
      },
    })

    revalidatePath(`/posts/${post.slug}`)
    return { success: 'Comment submitted for review' }
  } catch (error) {
    console.error('Error submitting comment:', error)
    return { error: 'Failed to submit comment' }
  }
}

export async function moderateComment(formData: FormData) {
  const payload = await getPayload({ config })

  const commentId = formData.get('commentId') as string
  const action = formData.get('action') as 'approve' | 'reject' | 'spam'
  const moderationNotes = (formData.get('moderationNotes') as string) || undefined

  if (!commentId || !action) {
    return { error: 'Comment ID and action are required' }
  }

  try {
    // Get the current user
    const { user } = await getMeUser()

    if (!user || !user.role || !['editor', 'admin'].includes(user.role)) {
      return { error: 'Unauthorized' }
    }

    // Update comment status
    await payload.update({
      collection: 'comments',
      id: commentId,
      data: {
        status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'spam',
        moderatedBy: user.id,
        moderatorNotes: moderationNotes,
        moderatedAt: new Date().toISOString(),
      },
    })

    // Log the action
    const logAction =
      action === 'approve'
        ? 'approve_comment'
        : action === 'reject'
          ? 'reject_comment'
          : 'spam_comment'
    await payload.create({
      collection: 'admin-logs',
      data: {
        action: logAction,
        user: user.id,
        resourceType: 'comments',
        resourceId: commentId,
        timestamp: new Date().toISOString(),
        details: JSON.stringify({
          moderationNotes,
        }),
      },
    })

    // Get the post to revalidate its page
    const _comment = await payload.findByID({
      collection: 'comments',
      id: commentId,
    })

    if (_comment.post && typeof _comment.post === 'object') {
      revalidatePath(`/posts/${_comment.post.slug}`)
    }

    return { success: `Comment ${action}d successfully` }
  } catch (error) {
    console.error('Error moderating comment:', error)
    return { error: 'Failed to moderate comment' }
  }
}

export async function reportComment(formData: FormData) {
  const payload = await getPayload({ config })

  const commentId = formData.get('commentId') as string
  const reason = formData.get('reason') as string

  if (!commentId) {
    return { error: 'Comment ID is required' }
  }

  try {
    // TODO: Get the current user from session/context
    // For now, mock user for testing
    const mockUser = { id: 'user1' }

    if (!mockUser) {
      return { error: 'You must be logged in to report comments' }
    }

    // Update comment with report
    await payload.update({
      collection: 'comments',
      id: commentId,
      data: {
        reportedBy: mockUser.id,
        reportReason: reason,
        reportedAt: new Date().toISOString(),
      },
    })

    // Log the report
    await payload.create({
      collection: 'admin-logs',
      data: {
        action: 'comment_reported',
        user: mockUser.id,
        resourceType: 'comments',
        resourceId: commentId,
        timestamp: new Date().toISOString(),
        details: JSON.stringify({
          reason,
        }),
      },
    })

    return { success: 'Comment reported successfully' }
  } catch (error) {
    console.error('Error reporting comment:', error)
    return { error: 'Failed to report comment' }
  }
}
