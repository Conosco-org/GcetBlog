import { getPayload } from 'payload'
import config from '@payload-config'
import { CommentModerationList } from './CommentModerationList'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import Link from 'next/link'
import { Clock, MessageSquare, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { User } from '@/payload-types'
import { PageHeader } from '@/components/base/PageHeader'
import { EmptyState } from '@/components/base/EmptyState'

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function CommentModerationPage({ searchParams }: PageProps) {
  const params = await searchParams
  const payload = await getPayload({ config })
  const requestHeaders = await headers()

  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) {
    redirect('/login')
  }

  const typedUser = user as User & { role: string }

  if (typedUser.role !== 'editor') {
    redirect('/dashboard')
  }

  const currentUser = { id: typedUser.id, role: typedUser.role, name: typedUser.name || 'User' }

  const page = Math.max(1, Number(params.page) || 1)

  // Parallel queries
  const [pendingPosts, pendingComments, reportedComments] = await Promise.all([
    payload.count({
      collection: 'posts',
      where: { _status: { equals: 'draft' } },
    }),
    payload.find({
      collection: 'comments',
      where: { status: { equals: 'pending' } },
      sort: '-createdAt',
      limit: 20,
      page,
    }),
    payload.find({
      collection: 'comments',
      where: {
        and: [
          { reportedBy: { exists: true } },
          { status: { equals: 'pending' } },
        ],
      },
      sort: '-reportedAt',
      limit: 20,
    }),
  ])

  return (
    <div className="p-8 min-h-screen">
      <PageHeader
        title="Comment Moderation"
        description="Review and moderate user comments"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Pending Posts */}
        <Card className="border-t-4 border-t-orange-500">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-muted-foreground text-sm font-medium mb-1">Pending Posts</p>
                <p className="text-4xl font-bold text-foreground">{pendingPosts.totalDocs}</p>
              </div>
              <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Comments */}
        <Card className="border-t-4 border-t-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-muted-foreground text-sm font-medium mb-1">Pending Comments</p>
                <p className="text-4xl font-bold text-foreground">{pendingComments.totalDocs}</p>
                <p className="text-sm text-orange-600 dark:text-orange-400 mt-2">{reportedComments.totalDocs} flagged</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scheduled Posts */}
        <Card className="border-t-4 border-t-purple-500">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-muted-foreground text-sm font-medium mb-1">Scheduled Posts</p>
                <p className="text-4xl font-bold text-foreground">0</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Card className="mb-6">
        <div className="border-b">
          <nav className="flex">
            <Link 
              href="/editor/queue"
              className="px-6 py-4 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-b-2 hover:border-muted-foreground transition-colors"
            >
              Post Approvals ({pendingPosts.totalDocs})
            </Link>
            <Link 
              href="/editor/comments"
              className="px-6 py-4 text-sm font-medium text-primary border-b-2 border-primary"
            >
              Comment Moderation ({pendingComments.totalDocs})
            </Link>
            <button 
              className="px-6 py-4 text-sm font-medium text-muted-foreground/50 cursor-not-allowed"
              disabled
              title="Coming soon"
            >
              Publishing Schedule (0)
            </button>
          </nav>
        </div>
      </Card>

      {/* Content */}
      <div className="space-y-8">
        <section>
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
                <CommentModerationList comments={pendingComments.docs} currentUser={currentUser} />
              ) : (
                <EmptyState
                  icon={MessageSquare}
                  title="No pending comments"
                  description="All comments have been reviewed"
                />
              )}
              {pendingComments.totalPages > 1 && (
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  Showing page {pendingComments.page} of {pendingComments.totalPages} ({pendingComments.totalDocs} total)
                </p>
              )}
            </CardContent>
          </Card>
        </section>

        <section>
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
                <CommentModerationList comments={reportedComments.docs} currentUser={currentUser} />
              ) : (
                <EmptyState
                  icon={MessageSquare}
                  title="No reported comments"
                  description="No comments have been flagged by users"
                />
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
