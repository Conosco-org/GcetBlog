import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LogoutButton } from '@frontend/components/shared/logout-button'
import type { User } from '@/shared/types/payload-types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function EditorDashboardPage() {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()

  // Authenticate the request
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) {
    redirect('/login')
  }

  const typedUser = user as User & { role: string }

  // Only editors can access this page (admins are editors with isAdmin flag)
  if (typedUser.role !== 'editor') {
    redirect('/dashboard')
  }

  // Get pending posts for review
  const pendingPosts = await payload.find({
    collection: 'posts',
    where: {
      _status: {
        equals: 'draft',
      },
    },
    limit: 10,
    sort: '-createdAt',
  })

  // Get pending comments for moderation
  const pendingComments = await payload.find({
    collection: 'comments',
    where: {
      status: {
        equals: 'pending',
      },
    },
    limit: 10,
    sort: '-createdAt',
  })

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Editor Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome, <span className="font-medium">{typedUser.name || typedUser.email}</span> | Role: <span className="font-medium capitalize">{typedUser.role}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <Link 
            href="/admin" 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Full CMS Admin
          </Link>
          <LogoutButton />
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="p-6 border rounded-lg bg-white shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Pending Posts</h3>
          <p className="text-3xl font-bold mt-2">{pendingPosts.totalDocs}</p>
        </div>
        <div className="p-6 border rounded-lg bg-white shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Pending Comments</h3>
          <p className="text-3xl font-bold mt-2">{pendingComments.totalDocs}</p>
        </div>
        <div className="p-6 border rounded-lg bg-white shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Your Role</h3>
          <p className="text-3xl font-bold mt-2 capitalize">{typedUser.role}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Posts */}
        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Pending Posts</h2>
            <Link 
              href="/editor/queue" 
              className="text-sm text-blue-600 hover:underline"
            >
              View All
            </Link>
          </div>
          {pendingPosts.docs.length > 0 ? (
            <ul className="space-y-3">
              {pendingPosts.docs.slice(0, 5).map((post) => (
                <li key={post.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium">{post.title}</p>
                    <p className="text-sm text-gray-500">
                      by {Array.isArray(post.authors) && post.authors.length > 0 && typeof post.authors[0] === 'object' ? post.authors[0].name : 'Unknown'}
                    </p>
                  </div>
                  <Link
                    href={`/admin/collections/posts/${post.id}`}
                    className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    Review
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center py-8">No pending posts</p>
          )}
        </div>

        {/* Pending Comments */}
        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Pending Comments</h2>
            <Link 
              href="/editor/comments" 
              className="text-sm text-blue-600 hover:underline"
            >
              View All
            </Link>
          </div>
          {pendingComments.docs.length > 0 ? (
            <ul className="space-y-3">
              {pendingComments.docs.slice(0, 5).map((comment) => (
                <li key={comment.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm line-clamp-2">{comment.content}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      by {typeof comment.author === 'object' && comment.author ? comment.author.name : 'Anonymous'}
                    </p>
                  </div>
                  <Link
                    href={`/admin/collections/comments/${comment.id}`}
                    className="text-sm px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                  >
                    Moderate
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center py-8">No pending comments</p>
          )}
        </div>
      </div>

      {/* Editor Tools */}
      <div className="grid gap-4 md:grid-cols-4">
        <Link
          href="/admin/collections/posts/create"
          className="p-4 border rounded-lg text-center hover:bg-gray-50 transition"
        >
          <h3 className="font-medium mb-1">Create Post</h3>
          <p className="text-sm text-gray-500">Write a new article</p>
        </Link>
        <Link
          href="/editor/queue"
          className="p-4 border rounded-lg text-center hover:bg-gray-50 transition"
        >
          <h3 className="font-medium mb-1">Review Queue</h3>
          <p className="text-sm text-gray-500">Approve submissions</p>
        </Link>
        <Link
          href="/admin/collections/media"
          className="p-4 border rounded-lg text-center hover:bg-gray-50 transition"
        >
          <h3 className="font-medium mb-1">Media Library</h3>
          <p className="text-sm text-gray-500">Manage images</p>
        </Link>
        <Link
          href="/admin/collections/categories"
          className="p-4 border rounded-lg text-center hover:bg-gray-50 transition"
        >
          <h3 className="font-medium mb-1">Categories</h3>
          <p className="text-sm text-gray-500">Organize content</p>
        </Link>
      </div>
    </div>
  )
}
