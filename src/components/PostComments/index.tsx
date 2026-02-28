import { getPayload } from 'payload'
import { headers as nextHeaders } from 'next/headers'
import configPromise from '@payload-config'
import { CommentForm } from '@/components/CommentForm'
import { CommentList } from '@/components/CommentList'
import type { Post } from '@/payload-types'

interface PostCommentsProps {
  post: Post
}

export async function PostComments({ post }: PostCommentsProps) {
  const payload = await getPayload({ config: configPromise })

  // Check if the current request belongs to an authenticated user
  let currentUser: { id: string; name: string; email: string; role: string } | null = null
  try {
    const headersList = await nextHeaders()
    const { user } = await payload.auth({ headers: headersList })
    if (user) {
      currentUser = {
        id: String(user.id),
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'contributor',
      }
    }
  } catch {
    // unauthenticated — fine
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

  return (
    <section className="mt-12 pt-8 border-t border-border">
      <h2 className="text-xl font-bold mb-6">Discussion</h2>

      {/* New comment form */}
      <CommentForm postId={postId} user={currentUser} />

      {/* Comments list */}
      <div className="mt-8">
        <CommentList
          comments={comments.docs}
          postId={postId}
          currentUser={currentUser as any}
        />
      </div>
    </section>
  )
}

