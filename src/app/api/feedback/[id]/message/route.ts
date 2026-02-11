import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import type { User } from '@/payload-types'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getPayload({ config: configPromise })
    const requestHeaders = await headers()
    const { user } = await payload.auth({ headers: requestHeaders })
    const { id: feedbackId } = await params

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const typedUser = user as User & { role: string }
    const body = await request.json()
    const { content } = body

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      )
    }

    // Get the feedback conversation
    let feedback
    try {
      feedback = await payload.findByID({
        collection: 'feedback',
        id: feedbackId,
        depth: 2,
      })
    } catch {
      return NextResponse.json(
        { error: 'Feedback conversation not found' },
        { status: 404 }
      )
    }

    if (!feedback) {
      return NextResponse.json(
        { error: 'Feedback conversation not found' },
        { status: 404 }
      )
    }

    // Check if user is allowed to participate in this conversation
    const contributorId = typeof feedback.contributor === 'object' ? feedback.contributor.id : feedback.contributor
    const editorId = typeof feedback.editor === 'object' ? feedback.editor.id : feedback.editor

    if (user.id !== contributorId && user.id !== editorId) {
      return NextResponse.json(
        { error: 'Forbidden: You cannot participate in this conversation' },
        { status: 403 }
      )
    }

    // Add the new message to the feedback
    const newMessage = {
      content: content.trim(),
      sender: user.id,
      timestamp: new Date().toISOString(),
    }

    const updatedMessages = [...(feedback.messages || []), newMessage]

    // Update the feedback with the new message
    const updatedFeedback = await payload.update({
      collection: 'feedback',
      id: feedbackId,
      data: {
        messages: updatedMessages,
        status: 'active', // Mark as active when new message is added
      },
      user,
    })

    return NextResponse.json({ success: true, feedback: updatedFeedback })
  } catch (error) {
    console.error('Error adding message to feedback:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}