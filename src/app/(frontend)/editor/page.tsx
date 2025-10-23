import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Link from 'next/link'
import { Clock, CheckCircle2, MessageSquare, Image, Calendar, ChevronRight } from 'lucide-react'

export default async function EditorDashboardPage() {
  const payload = await getPayload({ config: configPromise })

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

  // Get newly submitted posts today
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const newPostsToday = await payload.count({
    collection: 'posts',
    where: {
      _status: {
        equals: 'draft',
      },
      createdAt: {
        greater_than: today.toISOString(),
      },
    },
  })

  // Get approved posts from the last 24 hours
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
  
  const approvedPosts = await payload.find({
    collection: 'posts',
    where: {
      _status: {
        equals: 'published',
      },
      publishedAt: {
        greater_than: yesterday.toISOString(),
      },
    },
    limit: 10,
    sort: '-publishedAt',
  })

  // Get approved posts from 48 hours ago for comparison
  const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000)
  const previousDayApprovals = await payload.count({
    collection: 'posts',
    where: {
      _status: {
        equals: 'published',
      },
      publishedAt: {
        greater_than: twoDaysAgo.toISOString(),
        less_than: yesterday.toISOString(),
      },
    },
  })

  // Calculate percentage change
  const approvalChange = previousDayApprovals.totalDocs > 0
    ? Math.round(((approvedPosts.totalDocs - previousDayApprovals.totalDocs) / previousDayApprovals.totalDocs) * 100)
    : approvedPosts.totalDocs > 0 ? 100 : 0

  // Get pending comments for moderation
  const pendingComments = await payload.find({
    collection: 'comments',
    where: {
      status: {
        equals: 'pending',
      },
    },
  })

  // Get reported comments
  const reportedComments = await payload.count({
    collection: 'comments',
    where: {
      status: {
        equals: 'reported',
      },
    },
  })

  // Get media uploaded this week
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  
  const recentMedia = await payload.find({
    collection: 'media',
    where: {
      createdAt: {
        greater_than: weekAgo.toISOString(),
      },
    },
  })

  // Get all media to calculate storage
  const allMedia = await payload.find({
    collection: 'media',
    limit: 1000, // Adjust as needed
  })

  // Calculate actual storage used
  const totalBytes = allMedia.docs.reduce((sum, media) => {
    return sum + (media.filesize || 0)
  }, 0)
  const storageGB = (totalBytes / (1024 * 1024 * 1024)).toFixed(2)

  // Get recent posts for activity feed
  const allPosts = await payload.find({
    collection: 'posts',
    limit: 5,
    sort: '-updatedAt',
    depth: 2,
  })

  // Get recent comments for activity feed
  const allComments = await payload.find({
    collection: 'comments',
    limit: 5,
    sort: '-createdAt',
    depth: 1,
  })

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-900">Editor Dashboard</h1>
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition relative">
              <Calendar className="w-5 h-5 text-gray-600" />
            </button>
            <Link 
              href="/editor/queue"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
            >
              Schedule Post
            </Link>
            <Link 
              href="/admin/collections/posts/create"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              + New Post
            </Link>
          </div>
        </div>
        <p className="text-gray-600">Welcome back! Here&apos;s what&apos;s happening with your content today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Pending Reviews */}
        <div className="bg-white rounded-xl border-t-4 border-orange-500 p-6 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Pending Reviews</p>
              <p className="text-gray-500 text-xs">Awaiting review</p>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-500" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-4xl font-bold text-gray-900">{pendingPosts.totalDocs}</p>
              {newPostsToday.totalDocs > 0 && (
                <p className="text-sm text-green-600 mt-1">{newPostsToday.totalDocs} new today</p>
              )}
            </div>
          </div>
        </div>

        {/* Content Approved */}
        <div className="bg-white rounded-xl border-t-4 border-green-500 p-6 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Content Approved</p>
              <p className="text-gray-500 text-xs">Last 24 hours</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-4xl font-bold text-gray-900">{approvedPosts.totalDocs}</p>
              {approvalChange !== 0 && (
                <p className={`text-sm mt-1 ${approvalChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {approvalChange > 0 ? '+' : ''}{approvalChange}% from yesterday
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Comments Pending */}
        <div className="bg-white rounded-xl border-t-4 border-blue-500 p-6 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Comments Pending</p>
              <p className="text-gray-500 text-xs">Comments to moderate</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-4xl font-bold text-gray-900">{pendingComments.totalDocs}</p>
              {reportedComments.totalDocs > 0 && (
                <p className="text-sm text-red-600 mt-1">{reportedComments.totalDocs} reported</p>
              )}
            </div>
          </div>
        </div>

        {/* Media Uploaded */}
        <div className="bg-white rounded-xl border-t-4 border-purple-500 p-6 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Media Uploaded</p>
              <p className="text-gray-500 text-xs">Files this week</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center">
              <Image className="w-6 h-6 text-purple-500" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-4xl font-bold text-gray-900">{recentMedia.totalDocs}</p>
              <p className="text-sm text-gray-600 mt-1">{storageGB}GB used</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
            <Link 
              href="/editor/activity" 
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              View All Activity
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {allPosts.docs.length === 0 && allComments.docs.length === 0 ? (
              <p className="text-center py-8 text-gray-500">No recent activity</p>
            ) : (
              <>
                {/* Show recent posts */}
                {allPosts.docs.slice(0, 2).map((post) => {
                  const author = Array.isArray(post.authors) && post.authors.length > 0 && typeof post.authors[0] === 'object'
                    ? post.authors[0]
                    : null
                  const initials = author?.name ? author.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'
                  const status = post._status
                  
                  return (
                    <div key={post.id} className="flex items-start gap-3 pb-4 border-b">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0" role="img" aria-label={`${author?.name || 'User'} avatar`}>
                        <span className="text-blue-700 font-semibold text-sm">{initials}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                          <span className="font-semibold">{author?.name || 'Unknown'}</span>{' '}
                          {status === 'published' ? 'published' : 'submitted'}{' '}
                          <span className="font-medium">&quot;{post.title}&quot;</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(post.updatedAt).toLocaleString()}
                        </p>
                      </div>
                      {status === 'published' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <Clock className="w-4 h-4 text-orange-500" />
                      )}
                    </div>
                  )
                })}

                {/* Show recent comments */}
                {allComments.docs.slice(0, 2).map((comment) => {
                  const author = typeof comment.author === 'object' && comment.author ? comment.author : null
                  const initials = author?.name ? author.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'A'
                  
                  return (
                    <div key={comment.id} className="flex items-start gap-3 pb-4 border-b last:border-0">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0" role="img" aria-label={`${author?.name || 'User'} avatar`}>
                        <span className="text-purple-700 font-semibold text-sm">{initials}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                          <span className="font-semibold">{author?.name || 'Anonymous'}</span> commented
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(comment.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <MessageSquare className="w-4 h-4 text-blue-500" />
                    </div>
                  )
                })}
              </>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/editor/queue"
              className="block w-full px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition font-medium text-center"
            >
              Review Queue
              <ChevronRight className="w-4 h-4 inline ml-2" />
            </Link>
            <Link
              href="/editor/content"
              className="block w-full px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium text-center"
            >
              Bulk Operations
            </Link>
            <Link
              href="/editor/queue"
              className="block w-full px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium text-center"
            >
              Schedule Posts
            </Link>
            <Link
              href="/editor/comments"
              className="block w-full px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium text-center"
            >
              Moderate Comments
            </Link>
            <Link
              href="/editor/analytics"
              className="block w-full px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium text-center"
            >
              View Analytics
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Approvals */}
      <div className="mt-6 bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Approvals</h2>
          <Link 
            href="/editor/content" 
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Showing {Math.min(approvedPosts.docs.length, 4)} of {approvedPosts.totalDocs} approvals
        </p>
        
        {approvedPosts.docs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="pb-3 text-sm font-semibold text-gray-700">Post Title</th>
                  <th className="pb-3 text-sm font-semibold text-gray-700">Category</th>
                  <th className="pb-3 text-sm font-semibold text-gray-700">Author</th>
                  <th className="pb-3 text-sm font-semibold text-gray-700">Date</th>
                  <th className="pb-3 text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {approvedPosts.docs.slice(0, 4).map((post) => {
                  const author = Array.isArray(post.authors) && post.authors.length > 0 && typeof post.authors[0] === 'object'
                    ? post.authors[0]
                    : null
                  const category = Array.isArray(post.categories) && post.categories.length > 0 && typeof post.categories[0] === 'object'
                    ? post.categories[0]
                    : null
                  const initials = author?.name ? author.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'U'
                  
                  return (
                    <tr key={post.id} className="hover:bg-gray-50">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0" role="img" aria-label="Author avatar">
                            <span className="text-blue-700 font-semibold text-sm">{initials}</span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{post.title}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {category?.title || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="py-4 text-sm text-gray-600">{author?.name || 'Unknown'}</td>
                      <td className="py-4 text-sm text-gray-600">
                        {new Date(post.publishedAt || post.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Published
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center py-8 text-gray-500">No recent approvals</p>
        )}
        
        <div className="flex items-center justify-between mt-6 pt-4 border-t">
          <button className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium disabled:opacity-50" disabled>
            Previous
          </button>
          <button className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium">
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
