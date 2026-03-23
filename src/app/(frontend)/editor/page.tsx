import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Link from 'next/link'
import { Clock, CheckCircle2, MessageSquare, Image as ImageIcon, ChevronRight, LayoutTemplate } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/base'
import { DashboardErrorFallback } from './components/DashboardErrorFallback'
import { formatDateTimeIST } from '@/utilities/formatDateTime'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Editor Dashboard',
}

// Force dynamic rendering for real-time data
export const dynamic = 'force-dynamic'
export const revalidate = 0

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
      recentLogs,
    ] = await Promise.all([
      // Pending posts for review
      payload.find({
        collection: 'posts',
        where: { 
          and: [
            { _status: { equals: 'draft' } },
            { reviewStatus: { equals: 'pending_review' } }
          ]
        },
        limit: 10,
        sort: '-submittedForReviewAt',
      }),
      // New posts submitted for review today count
      payload.count({
        collection: 'posts',
        where: {
          and: [
            { _status: { equals: 'draft' } },
            { reviewStatus: { equals: 'pending_review' } },
            { submittedForReviewAt: { greater_than: today.toISOString() } },
          ]
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
      // Media storage sample (limited for performance - full calc is on media page)
      payload.find({
        collection: 'media',
        limit: 500,
        depth: 0,
        select: { filesize: true },
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
      // Recent admin logs (includes template activity)
      payload.find({
        collection: 'admin-logs',
        limit: 5,
        sort: '-timestamp',
        depth: 1,
        where: {
          action: {
            in: [
              'template_created',
              'template_published',
              'template_unpublished',
              'template_updated',
              'template_deleted',
              'approve_post',
              'reject_post',
              'delete_post',
              'unpublish_post',
            ],
          },
        },
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
    <div className="p-4 md:p-8 min-h-screen bg-background">
      {/* Header */}
      <div className="mb-8">
        <PageHeader
          title="Editor Dashboard"
          description="Welcome back! Here's what's happening with your content today."
          action={
            <Button asChild>
              <Link href="/editor/posts/create">+ New Post</Link>
            </Button>
          }
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-8">
        {/* Pending Reviews */}
        <Card className="border-t-4 border-t-orange-500">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-sm font-medium text-muted-foreground mb-1">Pending Reviews</CardTitle>
                <CardDescription>Awaiting review</CardDescription>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500/10 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{pendingPosts.totalDocs}</p>
                {newPostsToday.totalDocs > 0 && (
                  <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">+{newPostsToday.totalDocs} submitted today</p>
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
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl sm:text-4xl font-bold text-foreground">{approvedPosts.totalDocs}</p>
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
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl sm:text-4xl font-bold text-foreground">{pendingComments.totalDocs}</p>
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
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500/10 rounded-full flex items-center justify-center">
                <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl sm:text-4xl font-bold text-foreground">{recentMedia.totalDocs}</p>
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
              {allPosts.docs.length === 0 && allComments.docs.length === 0 && recentLogs.docs.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No recent activity</p>
              ) : (
                <>
                  {/* Show recent admin logs (template activity, moderation, etc.) */}
                  {recentLogs.docs.slice(0, 3).map((log) => {
                    const logUser = typeof log.user === 'object' && log.user ? log.user : null
                    const initials = logUser?.name ? logUser.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'S'
                    const isTemplate = String(log.action).startsWith('template_')
                    const actionLabel = String(log.action).replace(/_/g, ' ').replace(/^\w/, (c: string) => c.toUpperCase())
                    
                    return (
                      <div key={log.id} className="flex items-start gap-3 pb-4 border-b last:border-0">
                        <div className={`w-10 h-10 ${isTemplate ? 'bg-indigo-500/10' : 'bg-primary/10'} rounded-full flex items-center justify-center flex-shrink-0`} role="img" aria-label={`${logUser?.name || 'System'} avatar`}>
                          {isTemplate ? (
                            <LayoutTemplate className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                          ) : (
                            <span className="text-primary font-semibold text-sm">{initials}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground">
                            <span className="font-semibold">{logUser?.name || 'System'}</span>{' '}
                            {log.details || actionLabel}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDateTimeIST(log.timestamp)}
                          </p>
                        </div>
                        {isTemplate ? (
                          <Badge variant="secondary" className="text-[10px] bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 shrink-0">
                            Template
                          </Badge>
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                        )}
                      </div>
                    )
                  })}

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
                            {formatDateTimeIST(post.updatedAt)}
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
                            {formatDateTimeIST(comment.createdAt)}
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
            <>
              {/* Mobile card view */}
              <div className="md:hidden divide-y">
                {approvedPosts.docs.slice(0, 4).map((post) => {
                  const author = Array.isArray(post.authors) && post.authors.length > 0 && typeof post.authors[0] === 'object'
                    ? post.authors[0]
                    : null
                  const category = Array.isArray(post.categories) && post.categories.length > 0 && typeof post.categories[0] === 'object'
                    ? post.categories[0]
                    : null
                  const initials = author?.name ? author.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'U'
                  
                  return (
                    <div key={post.id} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0" role="img" aria-label="Author avatar">
                          <span className="text-primary font-semibold text-xs">{initials}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground line-clamp-1">{post.title}</p>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              {category?.title || 'Uncategorized'}
                            </Badge>
                            <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 text-[10px] px-1.5 py-0">
                              Published
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <span>{author?.name || 'Unknown'}</span>
                            <span>•</span>
                            <span>{formatDateTimeIST(post.publishedAt || post.updatedAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              {/* Desktop table view */}
              <div className="hidden md:block overflow-x-auto">
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
                            {formatDateTimeIST(post.publishedAt || post.updatedAt)}
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
            </>
          ) : (
            <p className="text-center py-8 text-muted-foreground">No recent approvals</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
  } catch (error) {
    console.error('Dashboard error:', error)
    return <DashboardErrorFallback />
  }
}
