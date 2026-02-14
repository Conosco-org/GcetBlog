import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Edit, Upload, MessageSquare, User, Activity } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminLogsPage() {
  const payload = await getPayload({ config: configPromise })

  const logs = await payload.find({
    collection: 'admin-logs',
    limit: 100,
    sort: '-createdAt',
    depth: 1,
  })

  const getActivityIcon = (action: string) => {
    if (action.includes('approved') || action.includes('published'))
      return <CheckCircle className="w-4 h-4 text-green-500" />
    if (action.includes('rejected') || action.includes('deleted'))
      return <XCircle className="w-4 h-4 text-red-500" />
    if (action.includes('edited') || action.includes('updated'))
      return <Edit className="w-4 h-4 text-blue-500" />
    if (action.includes('uploaded') || action.includes('created'))
      return <Upload className="w-4 h-4 text-purple-500" />
    if (action.includes('comment'))
      return <MessageSquare className="w-4 h-4 text-orange-500" />
    return <User className="w-4 h-4 text-muted-foreground" />
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Activity Logs</h1>
        <p className="text-muted-foreground mt-1">
          Track all editorial and admin actions across the platform
        </p>
      </div>

      <Card>
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Showing {Math.min(logs.totalDocs, 100)} of {logs.totalDocs} activities
            </p>
          </div>
        </div>

        <div className="divide-y">
          {logs.docs.length > 0 ? (
            logs.docs.map((log) => {
              const logUser =
                typeof log.user === 'object' && log.user ? log.user : null

              return (
                <div
                  key={log.id}
                  className="px-6 py-4 hover:bg-muted/50 transition"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                      {(logUser?.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold">
                          {logUser?.name || 'Unknown User'}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {log.action}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {log.resourceType} — {log.resourceId}
                      </p>
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
            <div className="px-6 py-12 text-center text-muted-foreground">
              <Activity className="h-8 w-8 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No activity logs found</p>
              <p className="text-sm mt-1">
                Activity will appear here as actions are performed.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
