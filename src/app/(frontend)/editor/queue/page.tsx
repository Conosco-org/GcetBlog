import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { Clock, MessageSquare, Calendar, Plus } from 'lucide-react'
import Link from 'next/link'
import { ApprovalButtons } from './ApprovalButtons'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default async function EditorQueuePage() {
  const payload = await getPayload({ config: configPromise })

  // Get pending posts (posts submitted for review)
  const pendingPosts = await payload.find({
    collection: 'posts',
    where: {
      and: [
        {
          _status: { equals: 'draft' },
        },
        {
          reviewStatus: { equals: 'pending_review' },
        },
      ],
    },
    depth: 2,
    sort: '-submittedForReviewAt',
    limit: 50,
  })

  // Get pending comments
  const pendingComments = await payload.find({
    collection: 'comments',
    where: {
      status: { equals: 'pending' },
    },
    depth: 1,
    sort: '-createdAt',
  })

  // Get flagged comments
  const flaggedComments = await payload.find({
    collection: 'comments',
    where: {
      status: { equals: 'reported' },
    },
    depth: 1,
  })

  // Mock scheduled posts (you'd need to add a scheduledAt field to your schema)
  const scheduledPosts = 0

  // Helper function to calculate time ago
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
    <div className="p-8 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold">Review Queue</h1>
            <p className="text-muted-foreground">Manage pending content and moderation tasks</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Pending Posts */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-muted-foreground text-sm font-medium mb-1">Pending Posts</p>
                <p className="text-4xl font-bold">{pendingPosts.totalDocs}</p>
              </div>
              <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Comments */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-muted-foreground text-sm font-medium mb-1">Pending Comments</p>
                <p className="text-4xl font-bold">{pendingComments.totalDocs}</p>
                <p className="text-sm text-orange-600 mt-2">{flaggedComments.totalDocs} flagged</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scheduled Posts */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-muted-foreground text-sm font-medium mb-1">Scheduled Posts</p>
                <p className="text-4xl font-bold">{scheduledPosts}</p>
                {scheduledPosts > 0 && (
                  <p className="text-sm text-purple-600 mt-2">Next: Tomorrow 9 AM</p>
                )}
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
            <button className="px-6 py-4 text-sm font-medium text-primary border-b-2 border-primary">
              Post Approvals ({pendingPosts.totalDocs})
            </button>
            <button className="px-6 py-4 text-sm font-medium text-muted-foreground hover:text-foreground">
              Comment Moderation ({pendingComments.totalDocs})
            </button>
            <button className="px-6 py-4 text-sm font-medium text-muted-foreground hover:text-foreground">
              Publishing Schedule ({scheduledPosts})
            </button>
          </nav>
        </div>
      </Card>

      {/* Posts Awaiting Review */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Posts Awaiting Review</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input type="checkbox" className="rounded border-input" />
                </TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingPosts.docs.slice(0, 4).map((post) => {
                const author = Array.isArray(post.authors) && post.authors.length > 0 && typeof post.authors[0] === 'object'
                  ? post.authors[0]
                  : null
                const category = Array.isArray(post.categories) && post.categories.length > 0 && typeof post.categories[0] === 'object'
                  ? post.categories[0].title
                  : 'Uncategorized'

                return (
                  <TableRow key={post.id}>
                    <TableCell>
                      <input type="checkbox" className="rounded border-input" />
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{post.title}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                          {(author?.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm">{author?.name || 'Unknown'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{category}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {getTimeAgo(post.updatedAt)}
                    </TableCell>
                    <TableCell>
                      <ApprovalButtons postId={post.id} postTitle={post.title} />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
