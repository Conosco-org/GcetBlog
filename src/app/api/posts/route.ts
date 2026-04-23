import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { revalidatePath } from 'next/cache'
import config from '@payload-config'
import { validateFeaturedRange, validateMetaDescription } from '@frontend/features/posts/lib/post-validation'

// GET handler - list posts (proxies to Payload's built-in REST)
export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const { user } = await payload.auth({ headers: request.headers })
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')
    const sort = searchParams.get('sort') || '-createdAt'
    const draft = searchParams.get('draft') === 'true'

    const result = await payload.find({
      collection: 'posts',
      limit,
      page,
      sort,
      draft,
      user,
      overrideAccess: false,
    })

    return NextResponse.json(result)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch posts'
    return NextResponse.json(
      { message },
      { status: 500 }
    )
  }
}

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

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const body = await request.json()

    // Verify user is authenticated
    const { user } = await payload.auth({ headers: request.headers })
    
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const incomingMetaDescription =
      typeof body?.meta?.description === 'string' ? body.meta.description : body.metaDescription
    const metaError = validateMetaDescription(incomingMetaDescription)
    if (metaError) {
      return NextResponse.json({ message: metaError }, { status: 400 })
    }

    const featuredError = validateFeaturedRange(body.featuredFrom, body.featuredUntil)
    if (featuredError) {
      return NextResponse.json({ message: featuredError }, { status: 400 })
    }

    // Convert plain text content to Lexical format
    const lexicalContent = typeof body.content === 'string' 
      ? textToLexical(body.content)
      : body.content

    // Determine if this is a draft or submission for review
    const isDraft = body.isDraft === true
    const isPublishing = body._status === 'published'

    // Set review status based on whether it's a draft or submission
    let reviewStatus = 'draft'
    let submittedForReviewAt = null
    
    if (!isDraft && !isPublishing) {
      // Contributor submitting for review
      reviewStatus = 'pending_review'
      submittedForReviewAt = new Date().toISOString()
    } else if (body.reviewStatus) {
      // Use provided reviewStatus if available
      reviewStatus = body.reviewStatus
      submittedForReviewAt = body.submittedForReviewAt
    }

    const postData: Record<string, unknown> = {
      title: body.title,
      content: lexicalContent,
      categories: body.categories || [],
      authors: body.authors || [user.id],
      _status: 'draft', // Always create as draft first
      reviewStatus,
      submittedForReviewAt,
      heroImage: body.featuredImage || body.heroImage || undefined,
      tags: body.tags || undefined,
      featuredFrom: body.featuredFrom || undefined,
      featuredUntil: body.featuredUntil || undefined,
      publishedAt: body.publishDate || body.publishedAt || undefined,
      contentType: body.contentType || undefined,
      meta: {
        title: body.meta?.title || body.title,
        description: incomingMetaDescription || (typeof body.content === 'string' ? body.content.substring(0, 160) : ''),
      },
    }

    // Create the post as a draft first
    const draft = await payload.create({
      collection: 'posts',
      data: postData,
      draft: true,
    })

    let post = draft

    // If publishing, update with draft: false to properly create a published version
    if (isPublishing) {
      post = await payload.update({
        collection: 'posts',
        id: draft.id,
        data: {
          _status: 'published',
          publishedAt: body.publishedAt || new Date().toISOString(),
        },
        draft: false,
      })

      // Revalidate public pages
      revalidatePath('/')
      revalidatePath('/posts')
      if (post.slug) revalidatePath(`/posts/${post.slug}`)
    }

    return NextResponse.json({
      success: true,
      post,
      message: isPublishing ? 'Post published successfully!' : (isDraft ? 'Draft saved successfully!' : 'Post submitted for review!'),
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create post'
    return NextResponse.json(
      { 
        success: false,
        message 
      },
      { status: 500 }
    )
  }
}
