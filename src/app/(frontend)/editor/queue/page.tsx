import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { Clock, MessageSquare, Calendar } from 'lucide-react'
import Link from 'next/link'
import { ApprovalButtons } from './ApprovalButtons'

export default async function EditorQueuePage() {
  const payload = await getPayload({ config: configPromise })

  // Get pending posts (drafts that are ready for review)
  const pendingPosts = await payload.find({
    collection: 'posts',
    where: {
      _status: { equals: 'draft' },
    },
    depth: 2,
    sort: '-updatedAt',
    limit: 50,
  })

  // Get pending comments
  const pendingComments = await payload.find({
    collection: 'comments',
    where: {
      status: { equals: 'pending' },
    },
    depth: 1,
    sort: '-createdAt',
  })

  // Get flagged comments
  const flaggedComments = await payload.find({
    collection: 'comments',
    where: {
      status: { equals: 'reported' },
    },
    depth: 1,
  })

  // Mock scheduled posts (you'd need to add a scheduledAt field to your schema)
  const scheduledPosts = 0

  // Helper function to calculate time ago
  const getTimeAgo = (date: string) => {
    const now = new Date()
    const past = new Date(date)
    const diffMs = now.getTime() - past.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins} minutes ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    return `${diffDays} days ago`
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Review Queue</h1>
            <p className="text-gray-600">Manage pending content and moderation tasks</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Pending Posts */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Pending Posts</p>
              <p className="text-4xl font-bold text-gray-900">{pendingPosts.totalDocs}</p>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Pending Comments */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Pending Comments</p>
              <p className="text-4xl font-bold text-gray-900">{pendingComments.totalDocs}</p>
              <p className="text-sm text-orange-600 mt-2">{flaggedComments.totalDocs} flagged</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Scheduled Posts */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Scheduled Posts</p>
              <p className="text-4xl font-bold text-gray-900">{scheduledPosts}</p>
              {scheduledPosts > 0 && (
                <p className="text-sm text-purple-600 mt-2">Next: Tomorrow 9 AM</p>
              )}
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button className="px-6 py-4 text-sm font-medium text-blue-600 border-b-2 border-blue-600">
              Post Approvals ({pendingPosts.totalDocs})
            </button>
            <button className="px-6 py-4 text-sm font-medium text-gray-600 hover:text-gray-900">
              Comment Moderation ({pendingComments.totalDocs})
            </button>
            <button className="px-6 py-4 text-sm font-medium text-gray-600 hover:text-gray-900">
              Publishing Schedule ({scheduledPosts})
            </button>
          </nav>
        </div>
      </div>

      {/* Posts Awaiting Review */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Posts Awaiting Review</h2>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pendingPosts.docs.slice(0, 4).map((post) => {
                const author = Array.isArray(post.authors) && post.authors.length > 0 && typeof post.authors[0] === 'object'
                  ? post.authors[0]
                  : null
                const category = Array.isArray(post.categories) && post.categories.length > 0 && typeof post.categories[0] === 'object'
                  ? post.categories[0].title
                  : 'Uncategorized'

                return (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input type="checkbox" className="rounded border-gray-300" />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{post.title}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                          {(author?.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm text-gray-900">{author?.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {getTimeAgo(post.updatedAt)}
                    </td>
                    <td className="px-6 py-4">
                      <ApprovalButtons postId={post.id} postTitle={post.title} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
