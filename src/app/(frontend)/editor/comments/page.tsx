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

export default async function CommentModerationPage() {
  const payload = await getPayload({ config })
  const requestHeaders = await headers()

  // Authenticate the request
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) {
    redirect('/login')
  }

  const typedUser = user as User & { role: string }

  // Check if user has moderator permissions (admins are editors with isAdmin flag)
  if (typedUser.role !== 'editor') {
    redirect('/dashboard')
  }

  const currentUser = { id: typedUser.id, role: typedUser.role, name: typedUser.name || 'User' }

  // Get pending posts count for navigation
  const pendingPosts = await payload.count({
    collection: 'posts',
    where: {
      _status: { equals: 'draft' },
    },
  })

  // Get pending comments
  const pendingComments = await payload.find({
    collection: 'comments',
    where: {
      status: {
        equals: 'pending',
      },
    },
    sort: '-createdAt',
    limit: 50,
  })

  // Get reported comments that haven't been moderated yet
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
    <div className="p-8 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Comment Moderation</h1>
            <p className="text-muted-foreground">Review and moderate user comments</p>
          </div>
        </div>
      </div>

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
                <p className="text-muted-foreground bg-muted p-4 rounded-md text-center">No pending comments</p>
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
                <p className="text-muted-foreground bg-muted p-4 rounded-md text-center">No reported comments</p>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
