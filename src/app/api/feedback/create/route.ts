import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import type { User } from '@shared/types/payload-types'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const requestHeaders = await headers()
    const { user } = await payload.auth({ headers: requestHeaders })

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const typedUser = user as User & { role: string }

    if (typedUser.role !== 'editor') {
      return NextResponse.json(
        { error: 'Forbidden: Only editors can create feedback' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, postId, contributorId, type, initialMessage } = body

    // Validate required fields
    if (!title || !postId || !contributorId || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: title, postId, contributorId, type' },
        { status: 400 }
      )
    }

    if (!['critical', 'suggestions', 'praise', 'questions'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid feedback type' },
        { status: 400 }
      )
    }

    // Verify the post exists
    const post = await payload.findByID({
      collection: 'posts',
      id: postId,
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Verify the contributor exists
    const contributor = await payload.findByID({
      collection: 'users',
      id: contributorId,
    })

    if (!contributor || (contributor as User & { role: string }).role !== 'contributor') {
      return NextResponse.json(
        { error: 'Contributor not found' },
        { status: 404 }
      )
    }

    // Create the feedback with initial message if provided
    const messages = initialMessage ? [{
      content: initialMessage,
      sender: user.id,
      timestamp: new Date().toISOString(),
    }] : []

    const feedback = await payload.create({
      collection: 'feedback',
      data: {
        title,
        post: postId,
        contributor: contributorId,
        editor: user.id,
        type,
        status: 'active',
        messages,
      },
      user,
    })

    return NextResponse.json(feedback, { status: 201 })
  } catch (error) {
    console.error('Error creating feedback:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
