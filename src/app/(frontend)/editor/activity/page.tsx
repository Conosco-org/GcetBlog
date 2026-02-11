import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { CheckCircle, XCircle, Edit, Upload, MessageSquare, User, Filter } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

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
    return <User className="w-4 h-4 text-muted-foreground" />
  }

  return (
    <div className="p-8 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold">Activity Logs</h1>
            <p className="text-muted-foreground">Track all editorial actions and changes</p>
          </div>
          <div className="flex gap-3">
            <select className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background" title="Filter by action type">
              <option>All Actions</option>
              <option>Approvals</option>
              <option>Rejections</option>
              <option>Edits</option>
              <option>Uploads</option>
              <option>Comments</option>
            </select>
            <select className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background" title="Filter by user role">
              <option>All Users</option>
              <option>Admins</option>
              <option>Editors</option>
              <option>Contributors</option>
            </select>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <Card>
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          <p className="text-sm text-muted-foreground mt-1">Showing {Math.min(logs.totalDocs, 50)} of {logs.totalDocs} activities</p>
        </div>

        <div className="divide-y">
          {logs.docs.length > 0 ? (
            logs.docs.map((log) => {
              const user = typeof log.user === 'object' && log.user ? log.user : null
              
              return (
                <div key={log.id} className="px-6 py-4 hover:bg-muted/50 transition">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                      {(user?.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{user?.name || 'Unknown User'}</span>
                        <span className="text-muted-foreground text-sm">{log.action}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{log.resourceType} - {log.resourceId}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {getActivityIcon(log.action)}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="px-6 py-8 text-center text-muted-foreground">
              <p>No activity logs found. Activity will appear here as actions are performed.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t flex items-center justify-between">
          <Button variant="ghost" size="sm" disabled>
            Previous
          </Button>
          <Button variant="ghost" size="sm">
            Next
          </Button>
        </div>
      </Card>
    </div>
  )
}
