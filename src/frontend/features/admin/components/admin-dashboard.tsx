import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@frontend/components/ui/card'
import { Badge } from '@frontend/components/ui/badge'
import { Button } from '@frontend/components/ui/button'
import { PageHeader } from '@frontend/components/base'
import type { User } from '@shared/types/payload-types'
import {
  Users,
  FileText,
  ClipboardList,
  TrendingUp,
  ArrowUpRight,
  Activity,
  Shield,
  ShieldCheck,
} from 'lucide-react'

// Force dynamic rendering for real-time data
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminDashboard() {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })

  const typedUser = user as User

  // Date ranges
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)

  // Fetch recent users
  const recentUsers = await payload.find({
    collection: 'users',
    sort: '-createdAt',
    limit: 5,
    depth: 0,
  })

  // Fetch recent admin logs
  const recentLogs = await payload.find({
    collection: 'admin-logs',
    sort: '-createdAt',
    limit: 5,
    depth: 1,
  })

  // Stats - use count() for efficient counting
  const [
    totalUsers,
    totalPosts,
    pendingReviews,
    totalComments,
    adminCount,
    newUsersToday,
    recentActivity,
  ] = await Promise.all([
    payload.count({ collection: 'users' }),
    payload.count({ collection: 'posts' }),
    payload.count({
      collection: 'posts',
      where: { reviewStatus: { equals: 'pending_review' } },
    }),
    payload.count({ collection: 'comments' }),
    payload.count({ collection: 'users', where: { isAdmin: { equals: true } } }),
    payload.count({
      collection: 'users',
      where: { createdAt: { greater_than: today.toISOString() } },
    }),
    payload.count({
      collection: 'admin-logs',
      where: { createdAt: { greater_than: weekAgo.toISOString() } },
    }),
  ])

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-[1400px]">
      {/* Welcome Section */}
      <PageHeader
        title="Admin Dashboard"
        description={`Welcome back, ${typedUser.name || typedUser.email}`}
      />

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 xl:grid-cols-4">
        <Card className="border-t-4 border-t-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers.totalDocs}</div>
            {newUsersToday.totalDocs > 0 && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                +{newUsersToday.totalDocs} new today
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">Registered users</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminCount.totalDocs}</div>
            <p className="text-xs text-muted-foreground mt-1">Platform administrators</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPosts.totalDocs}</div>
            <p className="text-xs text-muted-foreground mt-1">Published & drafts</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingReviews.totalDocs}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Admin Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Admin Activity
            </CardTitle>
            <CardDescription>Latest administrative actions (last 7 days: {recentActivity.totalDocs})</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentLogs.docs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No recent admin activity</p>
              ) : (
                recentLogs.docs.map((log) => {
                  const logUser = typeof log.user === 'object' && log.user ? log.user : null
                  const initials = logUser?.name 
                    ? logUser.name.split(' ').map(n => n[0]).join('').toUpperCase() 
                    : 'A'
                  
                  return (
                    <div key={log.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-600 text-sm font-semibold text-white flex-shrink-0">
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{logUser?.name || 'Unknown Admin'}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {log.action?.replace(/_/g, ' ')} • {log.resourceType}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(log.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <Activity className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>Frequently used admin actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="secondary" className="w-full justify-between" asChild>
              <Link href="/admin-dashboard/users">
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Manage Users
                </span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
            
            <Button variant="outline" className="w-full justify-between" asChild>
              <Link href="/editor/queue">
                <span className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4" />
                  Review Queue
                </span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>

            <Button variant="outline" className="w-full justify-between" asChild>
              <Link href="/admin-dashboard/logs">
                <span className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Activity Logs
                </span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>

            <Button variant="outline" className="w-full justify-between" asChild>
              <Link href="/editor/content">
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Content Manager
                </span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Users */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Recent Users
              </CardTitle>
              <CardDescription>Latest registered users</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin-dashboard/users">View All</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentUsers.docs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No users yet.</p>
            ) : (
              recentUsers.docs.map((u) => {
                const userTyped = u as User
                return (
                  <div key={userTyped.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-semibold text-white">
                        {(userTyped.name || userTyped.email || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{userTyped.name || 'Unnamed'}</p>
                        <p className="text-xs text-muted-foreground">{userTyped.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {userTyped.isAdmin && (
                        <Badge variant="destructive" className="text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          Admin
                        </Badge>
                      )}
                      {userTyped.canManageAdmins && (
                        <Badge variant="outline" className="text-xs border-amber-500 text-amber-600">
                          <ShieldCheck className="h-3 w-3 mr-1" />
                          Super
                        </Badge>
                      )}
                      <Badge variant="outline" className="capitalize text-xs">
                        {userTyped.role || 'contributor'}
                      </Badge>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* System Stats Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            System Overview
          </CardTitle>
          <CardDescription>Platform statistics at a glance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col gap-1 p-3 rounded-md bg-muted/50">
              <p className="text-sm text-muted-foreground">Total Comments</p>
              <p className="text-2xl font-bold">{totalComments.totalDocs}</p>
            </div>
            <div className="flex flex-col gap-1 p-3 rounded-md bg-muted/50">
              <p className="text-sm text-muted-foreground">Pending Reviews</p>
              <p className="text-2xl font-bold text-orange-600">{pendingReviews.totalDocs}</p>
            </div>
            <div className="flex flex-col gap-1 p-3 rounded-md bg-muted/50">
              <p className="text-sm text-muted-foreground">Admin Actions (7d)</p>
              <p className="text-2xl font-bold">{recentActivity.totalDocs}</p>
            </div>
            <div className="flex flex-col gap-1 p-3 rounded-md bg-muted/50">
              <p className="text-sm text-muted-foreground">New Users Today</p>
              <p className="text-2xl font-bold text-green-600">{newUsersToday.totalDocs}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
