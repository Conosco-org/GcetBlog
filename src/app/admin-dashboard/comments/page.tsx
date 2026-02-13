import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Clock, MessageSquare, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AdminCommentModerationList } from './CommentModerationList'
import type { User } from '@/payload-types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminCommentsPage() {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) {
    redirect('/login')
  }

  // Fetch full user to get isAdmin field
  const fullUser = await payload.findByID({
    collection: 'users',
    id: user.id,
    depth: 0,
  })

  if (!fullUser.isAdmin) {
    redirect('/admin-dashboard')
  }

  // Get stats
  const pendingPosts = await payload.find({
    collection: 'posts',
    where: { _status: { equals: 'draft' } },
    limit: 0,
  })

  // Get pending comments
  const pendingComments = await payload.find({
    collection: 'comments',
    where: { status: { equals: 'pending' } },
    sort: '-createdAt',
    limit: 50,
  })

  // Get reported comments
  const reportedComments = await payload.find({
    collection: 'comments',
    where: {
      and: [
        { reportedBy: { exists: true } },
        { status: { equals: 'pending' } },
      ],
    },
    sort: '-reportedAt',
    limit: 50,
  })

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Comment Moderation</h1>
        <p className="text-muted-foreground mt-1">Review and moderate user comments</p>
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
                  {reportedComments.totalDocs} flagged
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
              className="px-6 py-4 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Post Approvals ({pendingPosts.totalDocs})
            </Link>
            <Link
              href="/admin-dashboard/comments"
              className="px-6 py-4 text-sm font-medium text-primary border-b-2 border-primary"
            >
              Comment Moderation ({pendingComments.totalDocs})
            </Link>
          </nav>
        </div>
      </Card>

      {/* Pending Comments */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            Pending Comments
            <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">
              {pendingComments.totalDocs}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {pendingComments.docs.length > 0 ? (
            <AdminCommentModerationList comments={pendingComments.docs} />
          ) : (
            <p className="text-muted-foreground bg-muted p-4 rounded-md text-center">No pending comments</p>
          )}
        </CardContent>
      </Card>

      {/* Reported Comments */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            Reported Comments
            <Badge variant="destructive">
              {reportedComments.totalDocs}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {reportedComments.docs.length > 0 ? (
            <AdminCommentModerationList comments={reportedComments.docs} />
          ) : (
            <p className="text-muted-foreground bg-muted p-4 rounded-md text-center">No reported comments</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
