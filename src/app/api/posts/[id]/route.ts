import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

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

    // Convert plain text content to Lexical format if needed
    const lexicalContent = typeof body.content === 'string' 
      ? textToLexical(body.content)
      : body.content

    // Update the post
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
        meta: body.meta,
        publishedAt: body._status === 'published' && !body.publishedAt 
          ? new Date().toISOString() 
          : body.publishedAt,
      },
    })

    return NextResponse.json({
      success: true,
      post,
      message: body._status === 'published' ? 'Post published successfully!' : 'Draft saved successfully!',
    })
  } catch (error: unknown) {
    console.error('Error updating post:', error)
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
