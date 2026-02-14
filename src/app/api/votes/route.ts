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

    // Recalculate post vote score
    const allVotes = await payload.find({
      collection: 'votes',
      where: { post: { equals: postId } },
      limit: 10000,
      pagination: false,
    })

    const score = allVotes.docs.reduce((sum, v) => sum + (v.value as number), 0)
    const upvotes = allVotes.docs.filter((v) => v.value === 1).length
    const downvotes = allVotes.docs.filter((v) => v.value === -1).length

    // Update post vote score
    await payload.update({
      collection: 'posts',
      id: postId,
      data: { voteScore: score },
    })

    return NextResponse.json({
      action,
      score,
      upvotes,
      downvotes,
      userVote: vote ? value : null,
    })
  } catch (error) {
    console.error('Vote error:', error)
    return NextResponse.json({ error: 'Failed to process vote' }, { status: 500 })
  }
}

/**
 * GET /api/votes?postId=xxx — Get vote data for a post
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const postId = searchParams.get('postId')

    if (!postId) {
      return NextResponse.json({ error: 'postId is required' }, { status: 400 })
    }

    const payload = await getPayload({ config: configPromise })

    // Get current user's vote (if authenticated)
    let userVote: number | null = null
    try {
      const requestHeaders = await headers()
      const { user } = await payload.auth({ headers: requestHeaders })
      if (user) {
        const myVote = await payload.find({
          collection: 'votes',
          where: {
            and: [
              { post: { equals: postId } },
              { user: { equals: user.id } },
            ],
          },
          limit: 1,
        })
        if (myVote.docs.length > 0) {
          userVote = myVote.docs[0]!.value as number
        }
      }
    } catch {
      // Not authenticated — that's fine
    }

    // Get total vote counts
    const allVotes = await payload.find({
      collection: 'votes',
      where: { post: { equals: postId } },
      limit: 10000,
      pagination: false,
    })

    const score = allVotes.docs.reduce((sum, v) => sum + (v.value as number), 0)
    const upvotes = allVotes.docs.filter((v) => v.value === 1).length
    const downvotes = allVotes.docs.filter((v) => v.value === -1).length

    return NextResponse.json({
      score,
      upvotes,
      downvotes,
      userVote,
    })
  } catch (error) {
    console.error('Get votes error:', error)
    return NextResponse.json({ error: 'Failed to get votes' }, { status: 500 })
  }
}
