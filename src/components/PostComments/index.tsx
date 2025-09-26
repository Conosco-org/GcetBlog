import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { CommentForm } from '@/components/CommentForm'
import { CommentList } from '@/components/CommentList'
import type { Post, User } from '@/payload-types'

interface PostCommentsProps {
  post: Post
}

export async function PostComments({ post }: PostCommentsProps) {
  const payload = await getPayload({ config: configPromise })

  // Get comments for this post
  const comments = await payload.find({
    collection: 'comments',
    where: {
      post: {
        equals: post.id,
      },
    },
    sort: '-createdAt',
    limit: 100,
  })

  // Get current user (in real app, this would come from session)
  // For now, we'll pass null (anonymous user)
  const currentUser: User | null = null

  return (
    <div className="max-w-4xl mx-auto mt-12 px-4">
      <div className="border-t pt-8">
        <h2 className="text-2xl font-bold mb-6">Comments</h2>

        {/* Comment Form */}
        <CommentForm postId={post.id} />

        {/* Comments List */}
        <div className="mt-8">
          <CommentList comments={comments.docs} currentUser={currentUser} />
        </div>
      </div>
    </div>
  )
}
