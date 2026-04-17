/**
 * Script to create test comments for testing the moderation system
 * Run with: npx tsx scripts/create-test-comments.ts
 */

import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/backend/payload.config'

async function createTestComments() {
  console.log('Creating test comments...')

  try {
    const payload = await getPayload({ config })

    // Find a post to attach comments to
    const posts = await payload.find({
      collection: 'posts',
      limit: 1,
    })

    if (posts.docs.length === 0) {
      console.error('✗ No posts found! Create a post first.')
      process.exit(1)
    }

    const post = posts.docs[0]
    console.log(`Using post: ${post.title}`)

    // Find or create a test user
    let testUser = await payload.find({
      collection: 'users',
      where: {
        email: { equals: 'testuser@example.com' },
      },
    })

    if (testUser.docs.length === 0) {
      const newUser = await payload.create({
        collection: 'users',
        data: {
          email: 'testuser@example.com',
          password: 'test123',
          name: 'Test User',
          role: 'contributor',
        },
      })
      testUser = {
        docs: [newUser],
        hasNextPage: false,
        hasPrevPage: false,
        limit: 10,
        pagingCounter: 1,
        totalDocs: 1,
        totalPages: 1,
      }
      console.log('✓ Created test user')
    }

    const user = testUser.docs[0]

    // Create test comments
    const comments = [
      {
        content: 'This is a great article! Thanks for sharing.',
        status: 'pending',
      },
      {
        content: 'I have a question about this topic. Can you elaborate?',
        status: 'pending',
      },
      {
        content: 'BUY CHEAP PRODUCTS NOW!!! CLICK HERE!!!',
        status: 'pending',
      },
      {
        content: 'This is spam content with malicious links.',
        status: 'pending',
      },
      {
        content: 'Great work! Looking forward to more content.',
        status: 'pending',
      },
    ]

    for (const commentData of comments) {
      await payload.create({
        collection: 'comments',
        data: {
          ...commentData,
          post: post.id,
          author: user.id,
          status: commentData.status as 'pending' | 'approved' | 'rejected' | 'spam',
        },
      })
    }

    console.log(`✓ Created ${comments.length} test comments`)
    console.log('\nTest data ready!')
    console.log('Post:', post.title)
    console.log('Comments: 5 pending comments')
    console.log('\nGo to: http://localhost:3000/editor/comments')
  } catch (error) {
    console.error('Error creating test comments:', error)
    process.exit(1)
  }

  process.exit(0)
}

// Run the script
createTestComments()
