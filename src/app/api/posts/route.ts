import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

// GET handler — list posts (proxies to Payload's built-in REST)
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
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Failed to fetch posts' },
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

    // Convert plain text content to Lexical format
    const lexicalContent = typeof body.content === 'string' 
      ? textToLexical(body.content)
      : body.content

    // Create the post
    const post = await payload.create({
      collection: 'posts',
      data: {
        title: body.title,
        content: lexicalContent,
        categories: body.categories || [],
        authors: body.authors || [user.id],
        _status: body._status || 'draft',
        reviewStatus: body.reviewStatus || 'draft',
        submittedForReviewAt: body.submittedForReviewAt,
        heroImage: body.heroImage || undefined,
        meta: body.meta || {
          title: body.title,
          description: typeof body.content === 'string' ? body.content.substring(0, 160) : '',
        },
        publishedAt: body._status === 'published' ? new Date().toISOString() : undefined,
      },
    })

    return NextResponse.json({
      success: true,
      post,
      message: body._status === 'published' ? 'Post published successfully!' : 'Draft saved successfully!',
    })
  } catch (error: any) {
    console.error('Error creating post:', error)
    return NextResponse.json(
      { 
        success: false,
        message: error.message || 'Failed to create post' 
      },
      { status: 500 }
    )
  }
}
