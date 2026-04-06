import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { revalidatePath } from 'next/cache'
import config from '@payload-config'
import { validateFeaturedRange, validateMetaDescription } from '@frontend/features/posts/lib/post-validation'

// Convert plain text to Lexical JSON format
function textToLexical(text: string) {
  // Split text into paragraphs
  const paragraphs = text.split('\n\n').filter(p => p.trim())
  
  return {
    root: {
      type: 'root',
      children: paragraphs.map(paragraph => ({
        type: 'paragraph',
        children: [
          {
            type: 'text',
            text: paragraph.trim(),
            format: 0,
            version: 1
          }
        ],
        format: '',
        indent: 0,
        version: 1
      })),
      format: '',
      indent: 0,
      version: 1
    }
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getPayload({ config })
    const { id } = await params

    // Verify user is authenticated
    const { user } = await payload.auth({ headers: request.headers })
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch the post to check permissions
    const post = await payload.findByID({
      collection: 'posts',
      id,
      draft: true,
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Check if user has permission to delete
    const userRole = (user as { role?: string }).role
    const isEditorOrAdmin = userRole === 'editor' || userRole === 'admin'

    // Editors and admins can delete any post
    if (!isEditorOrAdmin) {
      // Contributors can only delete their own unpublished posts
      const authorIds = (post.authors || []).map((a: unknown) =>
        typeof a === 'object' && a !== null && 'id' in a ? String((a as { id: unknown }).id) : String(a)
      )
      
      const isAuthor = authorIds.includes(String(user.id))
      const isPublished = post._status === 'published'

      if (!isAuthor) {
        return NextResponse.json(
          { error: 'You do not have permission to delete this post' },
          { status: 403 }
        )
      }

      if (isPublished) {
        return NextResponse.json(
          { error: 'Cannot delete published posts' },
          { status: 403 }
        )
      }
    }

    // Delete the post
    await payload.delete({
      collection: 'posts',
      id,
    })

    // Revalidate paths
    revalidatePath('/')
    revalidatePath('/posts')
    revalidatePath('/contributor/drafts')
    revalidatePath('/editor/queue')

    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully',
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete post'
    return NextResponse.json(
      { 
        success: false,
        error: message 
      },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getPayload({ config })
    const body = await request.json()
    const { id } = await params

    // Verify user is authenticated
    const { user } = await payload.auth({ headers: request.headers })
    
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const incomingMetaDescription =
      typeof body?.meta?.description === 'string' ? body.meta.description : undefined
    const metaError = validateMetaDescription(incomingMetaDescription)
    if (metaError) {
      return NextResponse.json({ message: metaError }, { status: 400 })
    }

    const featuredError = validateFeaturedRange(body.featuredFrom, body.featuredUntil)
    if (featuredError) {
      return NextResponse.json({ message: featuredError }, { status: 400 })
    }

    // Convert plain text content to Lexical format if needed
    const lexicalContent = typeof body.content === 'string' 
      ? textToLexical(body.content)
      : body.content

    const isPublishing = body._status === 'published'

    // Update the post - use draft: false when publishing to properly create a published version
    const post = await payload.update({
      collection: 'posts',
      id: id,
      data: {
        title: body.title,
        content: lexicalContent,
        categories: body.categories,
        _status: body._status,
        reviewStatus: body.reviewStatus,
        submittedForReviewAt: body.submittedForReviewAt,
        heroImage: body.heroImage,
        tags: body.tags,
        featuredFrom: body.featuredFrom,
        featuredUntil: body.featuredUntil,
        meta: body.meta,
        publishedAt: isPublishing && !body.publishedAt 
          ? new Date().toISOString() 
          : body.publishedAt,
      },
      draft: !isPublishing, // draft: false when publishing to create proper published version
    })

    // Revalidate if publishing
    if (isPublishing) {
      revalidatePath('/')
      revalidatePath('/posts')
      if (post.slug) revalidatePath(`/posts/${post.slug}`)
    }

    return NextResponse.json({
      success: true,
      post,
      message: isPublishing ? 'Post published successfully!' : 'Draft saved successfully!',
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update post'
    return NextResponse.json(
      { 
        success: false,
        message 
      },
      { status: 500 }
    )
  }
}
