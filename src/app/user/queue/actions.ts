'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { checkPermission } from '@/access/hasPermission'

export async function approvePost(postId: string, editorNotes?: string) {
  try {
    const payload = await getPayload({ config: configPromise })
    const requestHeaders = await headers()

    // Authenticate the request
    const { user } = await payload.auth({ headers: requestHeaders })

    if (!user || !checkPermission(user, 'blog:publish')) {
      throw new Error('Publishing access required')
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
    const updatedPost = await payload.update({
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
      console.log('Could not create audit log:', error)
    }

    // Revalidate multiple paths
    revalidatePath('/user/queue')
    revalidatePath('/editor')
    revalidatePath('/posts')
    revalidatePath(`/posts/${post.slug}`)
    revalidatePath('/')
    
    console.log('Post approved successfully:', {
      postId,
      slug: post.slug,
      reviewStatus: updatedPost.reviewStatus,
      _status: updatedPost._status,
    })

    return { success: true, message: 'Post approved and published successfully' }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to approve post',
    }
  }
}

export async function rejectPost(postId: string, reason?: string) {
  try {
    const payload = await getPayload({ config: configPromise })
    const requestHeaders = await headers()

    // Authenticate the request
    const { user } = await payload.auth({ headers: requestHeaders })

    if (!user || !checkPermission(user, 'blog:publish')) {
      throw new Error('Publishing access required')
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

    // Add rejection feedback to the post
    const updatedPost = await payload.update({
      collection: 'posts',
      id: postId,
      data: {
        editorFeedback: reason || 'Post rejected by editor',
        reviewStatus: 'rejected',
        _status: 'draft', // Keep as draft
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
          details: reason || 'Post rejected',
          timestamp: new Date().toISOString(),
        },
      })
    } catch (error) {
      console.log('Could not create audit log:', error)
    }

    // Revalidate multiple paths to ensure UI updates
    revalidatePath('/user/queue')
    revalidatePath('/editor')
    revalidatePath('/contributor/submissions')
    
    console.log('Post rejected successfully:', {
      postId,
      reviewStatus: updatedPost.reviewStatus,
      editorFeedback: updatedPost.editorFeedback,
    })

    return { success: true, message: 'Post rejected with feedback' }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to reject post',
    }
  }
}
