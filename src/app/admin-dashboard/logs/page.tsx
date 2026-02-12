import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Edit, MessageSquare, User, Activity, Clock } from 'lucide-react'
import type { User as UserType } from '@/payload-types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminLogsPage() {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) {
    redirect('/login')
  }
  if ((user as UserType).role !== 'admin') {
    redirect('/admin-dashboard')
  }

  // Fetch admin logs
  const logs = await payload.find({
    collection: 'admin-logs',
    limit: 100,
    sort: '-createdAt',
    depth: 1,
  })

  // Stats
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayLogs = logs.docs.filter((log) => new Date(log.createdAt) >= today)

  const approvals = logs.docs.filter((log) => log.action === 'approve_post' || log.action === 'approve_comment')
  const rejections = logs.docs.filter((log) => log.action === 'reject_post' || log.action === 'reject_comment' || log.action === 'delete_post')

  const getActivityIcon = (action: string) => {
    if (action === 'approve_post' || action === 'approve_comment')
      return <CheckCircle className="w-5 h-5 text-green-500" />
    if (action === 'reject_post' || action === 'reject_comment' || action === 'delete_post')
      return <XCircle className="w-5 h-5 text-red-500" />
    if (action === 'unpublish_post' || action === 'content_moderation')
      return <Edit className="w-5 h-5 text-blue-500" />
    if (action === 'role_change' || action === 'user_action')
      return <User className="w-5 h-5 text-purple-500" />
    if (action === 'spam_comment' || action === 'comment_reported')
      return <MessageSquare className="w-5 h-5 text-orange-500" />
    return <User className="w-5 h-5 text-muted-foreground" />
  }

  const getActionBadgeColor = (action: string) => {
    if (action === 'approve_post' || action === 'approve_comment')
      return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
    if (action === 'reject_post' || action === 'reject_comment' || action === 'delete_post')
      return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
    if (action === 'unpublish_post' || action === 'content_moderation')
      return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
    if (action === 'role_change' || action === 'user_action')
      return 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800'
    return 'bg-muted text-muted-foreground'
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Activity className="h-6 w-6 text-primary" />
          </div>
          Activity Logs
        </h1>
        <p className="text-muted-foreground mt-1">Track all administrative actions and changes</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Activity className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{logs.totalDocs}</p>
                <p className="text-sm text-muted-foreground">Total Activities</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{todayLogs.length}</p>
                <p className="text-sm text-muted-foreground">Today&apos;s Activities</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{approvals.length}</p>
                <p className="text-sm text-muted-foreground">Approvals</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <XCircle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{rejections.length}</p>
                <p className="text-sm text-muted-foreground">Rejections</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Recent Activity</span>
            <Badge variant="secondary">{logs.totalDocs} total</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {logs.docs.length > 0 ? (
              logs.docs.map((log) => {
                const logUser = typeof log.user === 'object' && log.user ? log.user : null

                return (
                  <div
                    key={log.id}
                    className="px-6 py-4 hover:bg-muted/50 transition flex items-start gap-4"
                  >
                    {/* User Avatar */}
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                      {((logUser as UserType)?.name || 'U').charAt(0).toUpperCase()}
                    </div>

                    {/* Activity Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold text-sm">
                          {(logUser as UserType)?.name || 'Unknown User'}
                        </span>
                        <Badge variant="outline" className={getActionBadgeColor(log.action || '')}>
                          {log.action}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {log.resourceType}
                        {log.resourceId && (
                          <span className="ml-1 font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                            {log.resourceId}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(log.createdAt).toLocaleString()}
                      </p>
                    </div>

                    {/* Action Icon */}
                    <div className="flex-shrink-0">{getActivityIcon(log.action || '')}</div>
                  </div>
                )
              })
            ) : (
              <div className="px-6 py-12 text-center text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No activity logs found</p>
                <p className="text-sm mt-1">Activity will appear here as actions are performed</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
