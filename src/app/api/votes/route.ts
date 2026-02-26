import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'

/**
 * POST /api/votes — Create or update a vote
 * Body: { postId: string, value: 1 | -1 }
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const requestHeaders = await headers()
    const { user } = await payload.auth({ headers: requestHeaders })

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { postId, value } = body

    if (!postId || (value !== 1 && value !== -1)) {
      return NextResponse.json(
        { error: 'Invalid request. postId and value (1 or -1) are required.' },
        { status: 400 },
      )
    }

    // Check if user already voted on this post
    const existing = await payload.find({
      collection: 'votes',
      where: {
        and: [
          { post: { equals: postId } },
          { user: { equals: user.id } },
        ],
      },
      limit: 1,
    })

    let vote
    let action: 'created' | 'updated' | 'removed'

    if (existing.docs.length > 0) {
      const existingVote = existing.docs[0]!
      
      if ((existingVote.value as number) === value) {
        // Same vote — remove it (toggle off)
        await payload.delete({
          collection: 'votes',
          id: existingVote.id,
        })
        action = 'removed'
        vote = null
      } else {
        // Different vote — update it
        vote = await payload.update({
          collection: 'votes',
          id: existingVote.id,
          data: { value },
        })
        action = 'updated'
      }
    } else {
      // New vote
      vote = await payload.create({
        collection: 'votes',
        data: {
          post: postId,
          user: user.id,
          value,
        },
      })
      action = 'created'
    }

    // Recalculate post vote counts
    const allVotes = await payload.find({
      collection: 'votes',
      where: { post: { equals: postId } },
      limit: 10000,
      pagination: false,
    })

    const upvotes = allVotes.docs.filter((v) => v.value === 1).length
    const downvotes = allVotes.docs.filter((v) => v.value === -1).length
    const score = upvotes - downvotes

    // Update cached counts on the post document
    await payload.update({
      collection: 'posts',
      id: postId,
      data: { voteScore: score, likesCount: upvotes },
    })

    return NextResponse.json({
      action,
      upvotes,
      userVote: vote ? value : null,
    })
  } catch (error) {
    console.error('Vote error:', error)
    return NextResponse.json({ error: 'Failed to process vote' }, { status: 500 })
  }
}
