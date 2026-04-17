'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function deletePost(postId: string) {
  try {
    const payload = await getPayload({ config: configPromise })
    const requestHeaders = await headers()

    // Authenticate the request
    const { user } = await payload.auth({ headers: requestHeaders })

    // Allow both editors and admins
    const userRole = (user as { role: string })?.role
    if (!user || (userRole !== 'editor' && userRole !== 'admin')) {
      throw new Error('Editor or admin access required')
    }

    // Get the post first to check status and get slug (use depth 0 to avoid relation issues)
    const post = await payload.findByID({
      collection: 'posts',
      id: postId,
      overrideAccess: true,
      depth: 0,
    })

    if (!post) {
      throw new Error('Post not found')
    }

    // Delete directly - Payload will handle unpublishing internally
    await payload.delete({
      collection: 'posts',
      id: postId,
      overrideAccess: true,
      depth: 0,
    })

    // Create audit log entry
    try {
      await payload.create({
        collection: 'admin-logs',
        data: {
          action: 'delete_post',
          resourceType: 'posts',
          resourceId: postId,
          user: user.id,
          details: `Deleted post: ${post.title}`,
          timestamp: new Date().toISOString(),
        },
      })
    } catch {
      // Silently fail if audit log cannot be created
    }

    revalidatePath('/editor/content')
    revalidatePath('/posts')
    revalidatePath(`/posts/${post.slug}`)
    revalidatePath('/')

    return { success: true, message: 'Post deleted successfully' }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete post',
    }
  }
}

export async function unpublishPost(postId: string) {
  try {
    const payload = await getPayload({ config: configPromise })
    const requestHeaders = await headers()

    // Authenticate the request
    const { user } = await payload.auth({ headers: requestHeaders })

    // Allow both editors and admins
    const userRole = (user as { role: string })?.role
    if (!user || (userRole !== 'editor' && userRole !== 'admin')) {
      throw new Error('Editor or admin access required')
    }

    // Get the post
    const post = await payload.findByID({
      collection: 'posts',
      id: postId,
    })

    if (!post) {
      throw new Error('Post not found')
    }

    if (post._status !== 'published') {
      throw new Error('Post is not published')
    }

    // Unpublish the post
    await payload.update({
      collection: 'posts',
      id: postId,
      data: {
        _status: 'draft',
        reviewStatus: 'draft',
      },
    })

    // Create audit log entry
    try {
      await payload.create({
        collection: 'admin-logs',
        data: {
          action: 'unpublish_post',
          resourceType: 'posts',
          resourceId: postId,
          user: user.id,
          details: `Unpublished post: ${post.title}`,
          timestamp: new Date().toISOString(),
        },
      })
    } catch (error) {
      console.error('Could not create audit log:', error)
    }

    revalidatePath('/editor/content')
    revalidatePath('/posts')
    revalidatePath(`/posts/${post.slug}`)
    revalidatePath('/')

    return { success: true, message: 'Post unpublished successfully' }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to unpublish post',
    }
  }
}
