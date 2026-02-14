import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    
    // Get user from cookies
    const token = request.cookies.get('payload-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user } = await payload.auth({ headers: request.headers })
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const {
      title,
      content,
      excerpt,
      categories,
      tags: _tags,
      metaDescription,
      publishDate,
      contentType: _contentType,
      featuredImage,
      isDraft,
    } = body

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    // Determine review status based on action
    const reviewStatus = isDraft ? 'draft' : 'pending_review'
    const status = isDraft ? 'draft' : 'draft' // Keep as draft until editor approves

    // Find category IDs if categories are provided
    let categoryIds: string[] = []
    if (categories && categories.length > 0) {
      const categoryDocs = await payload.find({
        collection: 'categories',
        where: {
          title: {
            in: categories,
          },
        },
        limit: categories.length,
      })
      categoryIds = categoryDocs.docs.map((cat) => cat.id)
    }

    // Generate a slug from the title
    const generateSlug = (str: string) => {
      return str
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with dashes
        .replace(/-+/g, '-') // Replace multiple dashes with single dash
        .trim()
    }

    const slug = generateSlug(title)

    // Create the post
    const post = await payload.create({
      collection: 'posts',
      data: {
        title,
        slug,
        content: typeof content === 'object' ? content : {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                version: 1,
                direction: 'ltr',
                format: '',
                indent: 0,
                children: [
                  {
                    type: 'text',
                    text: content,
                    format: 0,
                    version: 1,
                  },
                ],
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
          },
        },
        authors: [user.id],
        categories: categoryIds,
        reviewStatus,
        submittedForReviewAt: isDraft ? undefined : new Date().toISOString(),
        publishedAt: publishDate || undefined,
        heroImage: featuredImage || undefined,
        meta: {
          description: excerpt || metaDescription || '',
          title: title,
        },
        _status: status,
      },
    })

    return NextResponse.json({
      success: true,
      post,
      message: isDraft
        ? 'Draft saved successfully'
        : 'Post submitted for review successfully',
    })
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json(
      { error: 'Failed to create post', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
