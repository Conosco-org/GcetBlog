import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { User } from '@/payload-types'
import {
  Users,
  FileText,
  ClipboardList,
  MessageSquare,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react'

export default async function AdminDashboardPage() {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })

  const typedUser = user as User

  // Fetch recent users
  const recentUsers = await payload.find({
    collection: 'users',
    sort: '-createdAt',
    limit: 5,
    depth: 0,
  })

  // Fetch recent posts
  const recentPosts = await payload.find({
    collection: 'posts',
    sort: '-createdAt',
    limit: 5,
    depth: 0,
  })

  // Stats
  const [totalUsers, totalPosts, pendingReviews, totalComments] = await Promise.all([
    payload.find({ collection: 'users', limit: 0 }),
    payload.find({ collection: 'posts', limit: 0 }),
    payload.find({
      collection: 'posts',
      where: { reviewStatus: { equals: 'pending' } },
      limit: 0,
    }),
    payload.find({ collection: 'comments', limit: 0 }),
  ])

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-[1400px]">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, <span className="font-medium text-foreground">{typedUser.name || typedUser.email}</span>
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers.totalDocs}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPosts.totalDocs}</div>
            <p className="text-xs text-muted-foreground">Published & drafts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingReviews.totalDocs}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comments</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalComments.totalDocs}</div>
            <p className="text-xs text-muted-foreground">Total comments</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Recent Users
            </CardTitle>
            <CardDescription>Latest registered users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentUsers.docs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No users yet.</p>
              ) : (
                recentUsers.docs.map((u) => {
                  const typedU = u as User
                  return (
                    <div key={typedU.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-semibold text-white">
                          {(typedU.name || typedU.email || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{typedU.name || 'Unnamed'}</p>
                          <p className="text-xs text-muted-foreground">{typedU.email}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {typedU.role || 'contributor'}
                      </Badge>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>Frequently used admin actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Button variant="outline" className="h-auto flex-col items-start gap-1 p-4" asChild>
              <Link href="/admin-dashboard/users">
                <div className="flex w-full items-center justify-between">
                  <Users className="h-5 w-5 text-primary" />
                  <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
                </div>
                <span className="text-sm font-medium">Manage Users</span>
                <span className="text-xs text-muted-foreground">Roles & permissions</span>
              </Link>
            </Button>

            <Button variant="outline" className="h-auto flex-col items-start gap-1 p-4" asChild>
              <Link href="/admin-dashboard/queue">
                <div className="flex w-full items-center justify-between">
                  <ClipboardList className="h-5 w-5 text-primary" />
                  <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
                </div>
                <span className="text-sm font-medium">Review Queue</span>
                <span className="text-xs text-muted-foreground">Approve posts</span>
              </Link>
            </Button>

            <Button variant="outline" className="h-auto flex-col items-start gap-1 p-4" asChild>
              <Link href="/admin-dashboard/comments">
                <div className="flex w-full items-center justify-between">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
                </div>
                <span className="text-sm font-medium">Comments</span>
                <span className="text-xs text-muted-foreground">Moderate comments</span>
              </Link>
            </Button>

            <Button variant="outline" className="h-auto flex-col items-start gap-1 p-4" asChild>
              <Link href="/admin-dashboard/posts">
                <div className="flex w-full items-center justify-between">
                  <FileText className="h-5 w-5 text-primary" />
                  <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
                </div>
                <span className="text-sm font-medium">All Posts</span>
                <span className="text-xs text-muted-foreground">Content management</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Posts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Posts
          </CardTitle>
          <CardDescription>Latest content across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentPosts.docs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No posts yet.</p>
            ) : (
              recentPosts.docs.map((post) => (
                <div key={post.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{post.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Badge variant={post._status === 'published' ? 'default' : 'secondary'}>
                      {post._status || 'draft'}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
