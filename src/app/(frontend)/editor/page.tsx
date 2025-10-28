import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Link from 'next/link'
import { Clock, CheckCircle2, MessageSquare, Image, Calendar, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Editor Dashboard',
}

export default async function EditorDashboardPage() {
  try {
    const payload = await getPayload({ config: configPromise })

    // Prepare date ranges
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    // Parallelize all independent queries
    const [
      pendingPosts,
      newPostsToday,
      approvedPosts,
      previousDayApprovals,
      pendingComments,
      reportedComments,
      recentMedia,
      allMedia,
      allPosts,
      allComments,
    ] = await Promise.all([
      // Pending posts for review
      payload.find({
        collection: 'posts',
        where: { _status: { equals: 'draft' } },
        limit: 10,
        sort: '-createdAt',
      }),
      // New posts today count
      payload.count({
        collection: 'posts',
        where: {
          _status: { equals: 'draft' },
          createdAt: { greater_than: today.toISOString() },
        },
      }),
      // Approved posts (last 24h)
      payload.find({
        collection: 'posts',
        where: {
          _status: { equals: 'published' },
          publishedAt: { greater_than: yesterday.toISOString() },
        },
        limit: 10,
        sort: '-publishedAt',
      }),
      // Previous day approvals for comparison
      payload.count({
        collection: 'posts',
        where: {
          _status: { equals: 'published' },
          publishedAt: {
            greater_than: twoDaysAgo.toISOString(),
            less_than: yesterday.toISOString(),
          },
        },
      }),
      // Pending comments
      payload.find({
        collection: 'comments',
        where: { status: { equals: 'pending' } },
      }),
      // Reported comments count
      payload.count({
        collection: 'comments',
        where: { status: { equals: 'reported' } },
      }),
      // Recent media (this week)
      payload.find({
        collection: 'media',
        where: { createdAt: { greater_than: weekAgo.toISOString() } },
      }),
      // All media for storage calculation
      payload.find({
        collection: 'media',
        limit: 1000,
      }),
      // Recent posts for activity feed
      payload.find({
        collection: 'posts',
        limit: 5,
        sort: '-updatedAt',
        depth: 2,
      }),
      // Recent comments for activity feed
      payload.find({
        collection: 'comments',
        limit: 5,
        sort: '-createdAt',
        depth: 1,
      }),
    ])

    // Calculate percentage change
    const approvalChange = previousDayApprovals.totalDocs > 0
      ? Math.round(((approvedPosts.totalDocs - previousDayApprovals.totalDocs) / previousDayApprovals.totalDocs) * 100)
      : approvedPosts.totalDocs > 0 ? 100 : 0

    // Calculate storage
    const totalBytes = allMedia.docs.reduce((sum, media) => sum + (media.filesize || 0), 0)
    const storageGB = (totalBytes / (1024 * 1024 * 1024)).toFixed(2)

  return (
    <div className="p-8 min-h-screen bg-background">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-foreground">Editor Dashboard</h1>
          <div className="flex items-center gap-3">
            <Button asChild>
              <Link href="/editor/posts/create">
                + New Post
              </Link>
            </Button>
          </div>
        </div>
        <p className="text-muted-foreground">Welcome back! Here&apos;s what&apos;s happening with your content today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Pending Reviews */}
        <Card className="border-t-4 border-t-orange-500">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-sm font-medium text-muted-foreground mb-1">Pending Reviews</CardTitle>
                <CardDescription>Awaiting review</CardDescription>
              </div>
              <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-foreground">{pendingPosts.totalDocs}</p>
                {newPostsToday.totalDocs > 0 && (
                  <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">+{newPostsToday.totalDocs} new today</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Approved Today */}
        <Card className="border-t-4 border-t-green-500">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-sm font-medium text-muted-foreground mb-1">Approved Today</CardTitle>
                <CardDescription>Published posts</CardDescription>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-4xl font-bold text-foreground">{approvedPosts.totalDocs}</p>
                {approvalChange !== 0 && (
                  <p className={`text-sm mt-1 ${approvalChange > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {approvalChange > 0 ? '+' : ''}{approvalChange}% from yesterday
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comments Pending */}
        <Card className="border-t-4 border-t-blue-500">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-sm font-medium text-muted-foreground mb-1">Comments Pending</CardTitle>
                <CardDescription>Comments to moderate</CardDescription>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-4xl font-bold text-foreground">{pendingComments.totalDocs}</p>
                {reportedComments.totalDocs > 0 && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">{reportedComments.totalDocs} reported</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Media Uploaded */}
        <Card className="border-t-4 border-t-purple-500">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-sm font-medium text-muted-foreground mb-1">Media Uploaded</CardTitle>
                <CardDescription>Files this week</CardDescription>
              </div>
              <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center">
                <Image className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-4xl font-bold text-foreground">{recentMedia.totalDocs}</p>
                <p className="text-sm text-muted-foreground mt-1">{storageGB}GB used</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Recent Activity</CardTitle>
              <Button variant="link" asChild className="h-auto p-0">
                <Link href="/editor/activity" className="flex items-center gap-1">
                  View All Activity
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {allPosts.docs.length === 0 && allComments.docs.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No recent activity</p>
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
                      <div key={post.id} className="flex items-start gap-3 pb-4 border-b last:border-0">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0" role="img" aria-label={`${author?.name || 'User'} avatar`}>
                          <span className="text-primary font-semibold text-sm">{initials}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground">
                            <span className="font-semibold">{author?.name || 'Unknown'}</span>{' '}
                            {status === 'published' ? 'published' : 'submitted'}{' '}
                            <span className="font-medium">&quot;{post.title}&quot;</span>
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
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
                        <div className="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center flex-shrink-0" role="img" aria-label={`${author?.name || 'User'} avatar`}>
                          <span className="text-purple-700 dark:text-purple-300 font-semibold text-sm">{initials}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground">
                            <span className="font-semibold">{author?.name || 'Anonymous'}</span> commented
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
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
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="secondary" className="w-full justify-between" asChild>
              <Link href="/editor/queue">
                Review Queue
                <ChevronRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/editor/content">
                Bulk Operations
              </Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/editor/queue">
                Schedule Posts
              </Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/editor/comments">
                Moderate Comments
              </Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/editor/analytics">
                View Analytics
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Approvals */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Recent Approvals</CardTitle>
            <Button variant="link" asChild className="h-auto p-0">
              <Link href="/editor/content" className="flex items-center gap-1">
                View All
                <ChevronRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
          <CardDescription>
            Showing {Math.min(approvedPosts.docs.length, 4)} of {approvedPosts.totalDocs} approvals
          </CardDescription>
        </CardHeader>
        <CardContent>
          {approvedPosts.docs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="pb-3 text-sm font-semibold text-muted-foreground">Post Title</th>
                    <th className="pb-3 text-sm font-semibold text-muted-foreground">Category</th>
                    <th className="pb-3 text-sm font-semibold text-muted-foreground">Author</th>
                    <th className="pb-3 text-sm font-semibold text-muted-foreground">Date</th>
                    <th className="pb-3 text-sm font-semibold text-muted-foreground">Status</th>
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
                      <tr key={post.id} className="hover:bg-muted/50">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0" role="img" aria-label="Author avatar">
                              <span className="text-primary font-semibold text-sm">{initials}</span>
                            </div>
                            <span className="text-sm font-medium text-foreground">{post.title}</span>
                          </div>
                        </td>
                        <td className="py-4">
                          <Badge variant="secondary">
                            {category?.title || 'Uncategorized'}
                          </Badge>
                        </td>
                        <td className="py-4 text-sm text-muted-foreground">{author?.name || 'Unknown'}</td>
                        <td className="py-4 text-sm text-muted-foreground">
                          {new Date(post.publishedAt || post.updatedAt).toLocaleDateString()}
                        </td>
                        <td className="py-4">
                          <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-500/20">
                            Published
                          </Badge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">No recent approvals</p>
          )}
          
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
  } catch (error) {
    console.error('Dashboard error:', error)
    return (
      <div className="p-8 bg-background min-h-screen">
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="max-w-md">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <CardTitle className="text-xl">Failed to load dashboard</CardTitle>
              <CardDescription>
                There was an error loading your dashboard data. Please try refreshing the page.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }
}
