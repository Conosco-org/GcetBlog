'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function approvePost(postId: string, editorNotes?: string) {
  try {
    const payload = await getPayload({ config: configPromise })
    const requestHeaders = await headers()

    // Authenticate the request
    const { user } = await payload.auth({ headers: requestHeaders })

    if (!user || (user as { role: string }).role !== 'editor') {
      throw new Error('Editor access required')
    }

    // Get the post draft
    const post = await payload.findByID({
      collection: 'posts',
      id: postId,
      draft: true,
    })

    if (!post) {
      throw new Error('Post not found')
    }

    // Publish the post - convert draft to published version
    await payload.update({
      collection: 'posts',
      id: postId,
      data: {
        _status: 'published',
        reviewStatus: 'approved',
        publishedAt: new Date().toISOString(),
      },
      draft: false, // This publishes the draft
    })

    // Create audit log entry (we'll implement this collection later)
    try {
      await payload.create({
        collection: 'admin-logs',
        data: {
          action: 'approve_post',
          resourceType: 'posts',
          resourceId: postId,
          user: user.id,
          details: editorNotes || 'Post approved and published',
          timestamp: new Date().toISOString(),
        },
      })
    } catch (error) {
      // Log collection might not exist yet, continue without it
      console.error('Could not create audit log:', error)
    }

    // Revalidate multiple paths
    revalidatePath('/editor/queue')
    revalidatePath('/editor')
    revalidatePath('/posts')
    revalidatePath(`/posts/${post.slug}`)
    revalidatePath('/')

    return { success: true, message: 'Post approved and published successfully' }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to approve post',
    }
  }
}

export async function requestChanges(postId: string, feedback: string) {
  try {
    const payload = await getPayload({ config: configPromise })
    const requestHeaders = await headers()

    // Authenticate the request
    const { user } = await payload.auth({ headers: requestHeaders })

    if (!user || (user as { role: string }).role !== 'editor') {
      throw new Error('Editor access required')
    }

    // Get the post
    const post = await payload.findByID({
      collection: 'posts',
      id: postId,
      draft: true,
    })

    if (!post) {
      throw new Error('Post not found')
    }

    // Add feedback and return to requesting_changes status so contributor can edit
    await payload.update({
      collection: 'posts',
      id: postId,
      data: {
        editorFeedback: feedback || 'Changes requested by editor',
        reviewStatus: 'requesting_changes', // New status for posts with editor feedback
        _status: 'draft',
      },
      draft: true,
    })

    // Create audit log entry
    try {
      await payload.create({
        collection: 'admin-logs',
        data: {
          action: 'reject_post',
          resourceType: 'posts',
          resourceId: postId,
          user: user.id,
          details: `Changes requested: ${feedback}`,
          timestamp: new Date().toISOString(),
        },
      })
    } catch (error) {
      console.error('Could not create audit log:', error)
    }

    // Revalidate multiple paths to ensure UI updates
    revalidatePath('/editor/queue')
    revalidatePath('/editor')
    revalidatePath('/contributor/drafts')
    revalidatePath('/contributor/submissions')

    return { success: true, message: 'Feedback sent to contributor. Post returned to their drafts.' }
  } catch (error) {
    console.error('requestChanges failed:', error)
    
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to request changes',
    }
  }
}

export async function deletePost(postId: string, reason: string) {
  try {
    const payload = await getPayload({ config: configPromise })
    const requestHeaders = await headers()

    // Authenticate the request
    const { user } = await payload.auth({ headers: requestHeaders })

    if (!user || (user as { role: string }).role !== 'editor') {
      throw new Error('Editor access required')
    }

    // Get the post before deletion for logging and notification
    const post = await payload.findByID({
      collection: 'posts',
      id: postId,
      draft: true,
    })

    if (!post) {
      throw new Error('Post not found')
    }

    // Get the contributor (first author)
    const contributorId = Array.isArray(post.authors) && post.authors.length > 0
      ? typeof post.authors[0] === 'string' 
        ? post.authors[0] 
        : post.authors[0]?.id
      : null

    if (!contributorId) {
      throw new Error('Post has no author')
    }

    // Create rejection notification for the contributor
    try {
      await payload.create({
        collection: 'rejection-notifications',
        data: {
          postTitle: post.title,
          contributor: contributorId,
          rejectedBy: user.id,
          reason: reason,
          originalPostId: postId,
          isRead: false,
        },
      })
    } catch (error) {
      console.error('Failed to create rejection notification:', error)
      // Continue with deletion even if notification fails
    }

    // Create audit log entry before deletion
    try {
      await payload.create({
        collection: 'admin-logs',
        data: {
          action: 'reject_post',
          resourceType: 'posts',
          resourceId: postId,
          user: user.id,
          details: `Post "${post.title}" rejected and deleted. Reason: ${reason}`,
          timestamp: new Date().toISOString(),
        },
      })
    } catch (error) {
      console.error('Could not create audit log:', error)
    }

    // Delete the post permanently
    await payload.delete({
      collection: 'posts',
      id: postId,
    })

    // Revalidate paths
    revalidatePath('/editor/queue')
    revalidatePath('/editor')
    revalidatePath('/contributor/rejections')
    revalidatePath('/posts')
    revalidatePath('/')

    return { success: true, message: 'Post rejected and contributor notified' }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to reject post',
    }
  }
}
