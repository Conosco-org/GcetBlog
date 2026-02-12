import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Clock, MessageSquare, Calendar } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AdminQueueApprovalButtons } from './ApprovalButtons'
import type { User } from '@/payload-types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminQueuePage() {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) {
    redirect('/login')
  }
  if ((user as User).role !== 'admin') {
    redirect('/admin-dashboard')
  }

  // Get pending posts (submitted for review)
  const pendingPosts = await payload.find({
    collection: 'posts',
    where: {
      and: [
        { _status: { equals: 'draft' } },
        { reviewStatus: { equals: 'pending_review' } },
      ],
    },
    depth: 2,
    sort: '-submittedForReviewAt',
    limit: 50,
  })

  // Get pending comments
  const pendingComments = await payload.find({
    collection: 'comments',
    where: { status: { equals: 'pending' } },
    depth: 1,
    sort: '-createdAt',
  })

  // Get flagged comments
  const flaggedComments = await payload.find({
    collection: 'comments',
    where: { status: { equals: 'reported' } },
    depth: 1,
  })

  const getTimeAgo = (date: string) => {
    const now = new Date()
    const past = new Date(date)
    const diffMs = now.getTime() - past.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins} minutes ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    return `${diffDays} days ago`
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Review Queue</h1>
        <p className="text-muted-foreground mt-1">Manage pending content and moderation tasks</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium mb-1">Pending Posts</p>
                <p className="text-3xl font-bold">{pendingPosts.totalDocs}</p>
              </div>
              <div className="w-10 h-10 bg-orange-500/10 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium mb-1">Pending Comments</p>
                <p className="text-3xl font-bold">{pendingComments.totalDocs}</p>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                  {flaggedComments.totalDocs} flagged
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium mb-1">Scheduled Posts</p>
                <p className="text-3xl font-bold">0</p>
              </div>
              <div className="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Card>
        <div className="border-b">
          <nav className="flex">
            <Link
              href="/admin-dashboard/queue"
              className="px-6 py-4 text-sm font-medium text-primary border-b-2 border-primary"
            >
              Post Approvals ({pendingPosts.totalDocs})
            </Link>
            <Link
              href="/admin-dashboard/comments"
              className="px-6 py-4 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Comment Moderation ({pendingComments.totalDocs})
            </Link>
          </nav>
        </div>
      </Card>

      {/* Posts Awaiting Review */}
      <Card>
        <CardHeader>
          <CardTitle>Posts Awaiting Review</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingPosts.docs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-lg font-medium">All caught up!</p>
              <p className="text-sm mt-1">No posts are waiting for review.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingPosts.docs.map((post) => {
                  const author = Array.isArray(post.authors) && post.authors.length > 0 && typeof post.authors[0] === 'object'
                    ? post.authors[0]
                    : null
                  const category = Array.isArray(post.categories) && post.categories.length > 0 && typeof post.categories[0] === 'object'
                    ? post.categories[0].title
                    : 'Uncategorized'

                  return (
                    <TableRow key={post.id}>
                      <TableCell>
                        <p className="font-medium">{post.title}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                            {(author?.name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm">{author?.name || 'Unknown'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{category}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {getTimeAgo(post.updatedAt)}
                      </TableCell>
                      <TableCell>
                        <AdminQueueApprovalButtons postId={post.id} postTitle={post.title} postSlug={post.slug || ''} />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
