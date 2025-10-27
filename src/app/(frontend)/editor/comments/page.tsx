import { getPayload } from 'payload'
import config from '@payload-config'
import { CommentModerationList } from './CommentModerationList'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Clock, MessageSquare, Calendar } from 'lucide-react'

export default async function CommentModerationPage() {
  const payload = await getPayload({ config })

  // TODO: Get current user from session
  // For now, mock an admin user
  const mockUser = { id: 'admin', role: 'admin', name: 'Admin User' }

  // Check if user has moderator permissions
  if (!mockUser || !['editor', 'admin'].includes(mockUser.role)) {
    redirect('/dashboard')
  }

  // Get pending posts count for navigation
  const pendingPosts = await payload.count({
    collection: 'posts',
    where: {
      _status: { equals: 'draft' },
    },
  })

  // Get pending comments
  const pendingComments = await payload.find({
    collection: 'comments',
    where: {
      status: {
        equals: 'pending',
      },
    },
    sort: '-createdAt',
    limit: 50,
  })

  // Get reported comments
  const reportedComments = await payload.find({
    collection: 'comments',
    where: {
      reportedBy: {
        exists: true,
      },
    },
    sort: '-reportedAt',
    limit: 50,
  })

  const scheduledPosts = 0 // Mock for now

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Comment Moderation</h1>
            <p className="text-gray-600">Review and moderate user comments</p>
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
              <p className="text-sm text-orange-600 mt-2">{reportedComments.totalDocs} flagged</p>
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
            <Link 
              href="/editor/queue"
              className="px-6 py-4 text-sm font-medium text-gray-600 hover:text-gray-900 hover:border-b-2 hover:border-gray-300 transition-colors"
            >
              Post Approvals ({pendingPosts.totalDocs})
            </Link>
            <Link 
              href="/editor/comments"
              className="px-6 py-4 text-sm font-medium text-blue-600 border-b-2 border-blue-600"
            >
              Comment Moderation ({pendingComments.totalDocs})
            </Link>
            <button 
              className="px-6 py-4 text-sm font-medium text-gray-400 cursor-not-allowed"
              disabled
              title="Coming soon"
            >
              Publishing Schedule ({scheduledPosts})
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-8">
        <section>
          <div className="bg-white rounded-xl shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                Pending Comments
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm">
                  {pendingComments.totalDocs}
                </span>
              </h2>
            </div>

            <div className="p-6">
              {pendingComments.docs.length > 0 ? (
                <CommentModerationList comments={pendingComments.docs} currentUser={mockUser} />
              ) : (
                <p className="text-gray-500 bg-gray-50 p-4 rounded-md text-center">No pending comments</p>
              )}
            </div>
          </div>
        </section>

        <section>
          <div className="bg-white rounded-xl shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                Reported Comments
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm">
                  {reportedComments.totalDocs}
                </span>
              </h2>
            </div>

            <div className="p-6">
              {reportedComments.docs.length > 0 ? (
                <CommentModerationList comments={reportedComments.docs} currentUser={mockUser} />
              ) : (
                <p className="text-gray-500 bg-gray-50 p-4 rounded-md text-center">No reported comments</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
