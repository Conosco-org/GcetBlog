import { getPayload } from 'payload'
import config from '@payload-config'
import { CommentModerationList } from './CommentModerationList'
import { redirect } from 'next/navigation'

export default async function CommentModerationPage() {
  const payload = await getPayload({ config })

  // TODO: Get current user from session
  // For now, mock an admin user
  const mockUser = { id: 'admin', role: 'admin', name: 'Admin User' }

  // Check if user has moderator permissions
  if (!mockUser || !['editor', 'admin'].includes(mockUser.role)) {
    redirect('/dashboard')
  }

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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Comment Moderation</h1>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              Pending Comments
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm">
                {pendingComments.totalDocs}
              </span>
            </h2>

            {pendingComments.docs.length > 0 ? (
              <CommentModerationList comments={pendingComments.docs} currentUser={mockUser} />
            ) : (
              <p className="text-gray-500 bg-gray-50 p-4 rounded-md">No pending comments</p>
            )}
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              Reported Comments
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm">
                {reportedComments.totalDocs}
              </span>
            </h2>

            {reportedComments.docs.length > 0 ? (
              <CommentModerationList comments={reportedComments.docs} currentUser={mockUser} />
            ) : (
              <p className="text-gray-500 bg-gray-50 p-4 rounded-md">No reported comments</p>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
