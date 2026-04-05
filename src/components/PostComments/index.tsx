import { getPayload } from 'payload'
import { headers as nextHeaders } from 'next/headers'
import configPromise from '@payload-config'
import { CommentForm } from '@/components/CommentForm'
import { CommentList } from '@/components/CommentList'
import type { Post, User } from '@/payload-types'

interface PostCommentsProps {
  post: Post
}

export async function PostComments({ post }: PostCommentsProps) {
  const payload = await getPayload({ config: configPromise })

  // Check if the current request belongs to an authenticated user
  let currentUser: User | null = null
  try {
    const headersList = await nextHeaders()
    const { user } = await payload.auth({ headers: headersList })
    if (user) {
      currentUser = user as User
    }
  } catch {
    // unauthenticated - fine
  }

  // Fetch all comments for this post (top-level + replies in one query)
  const comments = await payload.find({
    collection: 'comments',
    where: {
      post: { equals: post.id },
    },
    sort: 'createdAt',
    limit: 200,
    depth: 1, // populate parent relation
  })

  const postId = String(post.id)

  // Create simplified user object for CommentForm
  const simplifiedUser = currentUser
    ? {
        id: String(currentUser.id),
        name: currentUser.name || '',
        email: currentUser.email || '',
      }
    : null

  return (
    <section className="mt-12 pt-8 border-t border-border">
      <h2 className="text-xl font-bold mb-6">Discussion</h2>

      {/* New comment form */}
      <CommentForm postId={postId} user={simplifiedUser} />

      {/* Comments list */}
      <div className="mt-8">
        <CommentList
          comments={comments.docs}
          postId={postId}
          currentUser={currentUser}
        />
      </div>
    </section>
  )
}

