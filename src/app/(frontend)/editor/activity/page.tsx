import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { CheckCircle, XCircle, Edit, Upload, MessageSquare, User, Filter } from 'lucide-react'

export default async function ActivityLogsPage() {
  const payload = await getPayload({ config: configPromise })

  // Get recent admin logs
  const logs = await payload.find({
    collection: 'admin-logs',
    limit: 50,
    sort: '-createdAt',
    depth: 1,
  })

  const getActivityIcon = (action: string) => {
    if (action.includes('approved') || action.includes('published')) return <CheckCircle className="w-4 h-4 text-green-500" />
    if (action.includes('rejected') || action.includes('deleted')) return <XCircle className="w-4 h-4 text-red-500" />
    if (action.includes('edited') || action.includes('updated')) return <Edit className="w-4 h-4 text-blue-500" />
    if (action.includes('uploaded') || action.includes('created')) return <Upload className="w-4 h-4 text-purple-500" />
    if (action.includes('comment')) return <MessageSquare className="w-4 h-4 text-orange-500" />
    return <User className="w-4 h-4 text-gray-500" />
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Activity Logs</h1>
            <p className="text-gray-600">Track all editorial actions and changes</p>
          </div>
          <div className="flex gap-3">
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
              <option>All Actions</option>
              <option>Approvals</option>
              <option>Rejections</option>
              <option>Edits</option>
              <option>Uploads</option>
              <option>Comments</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
              <option>All Users</option>
              <option>Admins</option>
              <option>Editors</option>
              <option>Contributors</option>
            </select>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium flex items-center gap-2">
              <Filter className="w-4 h-4" />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          <p className="text-sm text-gray-600 mt-1">Showing {Math.min(logs.totalDocs, 50)} of {logs.totalDocs} activities</p>
        </div>

        <div className="divide-y divide-gray-200">
          {logs.docs.length > 0 ? (
            logs.docs.map((log) => {
              const user = typeof log.user === 'object' && log.user ? log.user : null
              
              return (
                <div key={log.id} className="px-6 py-4 hover:bg-gray-50 transition">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                      {(user?.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">{user?.name || 'Unknown User'}</span>
                        <span className="text-gray-500 text-sm">{log.action}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{log.resourceType} - {log.resourceId}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(log.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {getActivityIcon(log.action)}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="px-6 py-8 text-center text-gray-500">
              <p>No activity logs found. Activity will appear here as actions are performed.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50" disabled>
            Previous
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
