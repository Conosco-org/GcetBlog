import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { PostForm } from './PostForm'

export default async function CreatePostPage() {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()

  // Authenticate the request
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) {
    redirect('/login')
  }

  // Editors, admins, and contributors can create posts
  if (!user.role || !['contributor', 'editor', 'admin'].includes(user.role)) {
    redirect('/dashboard')
  }

  // Get categories for the form
  const categories = await payload.find({
    collection: 'categories',
    limit: 100,
    sort: 'title',
  })

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Create New Post</h1>
          <p className="text-muted-foreground">Write and publish a new blog post</p>
        </div>

        <PostForm categories={categories.docs} user={user} />
      </div>
    </div>
  )
}
