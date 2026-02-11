import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import type { User } from '@/payload-types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/utilities/formatDateTime'
import Link from 'next/link'
import { Eye, Edit, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'

export default async function SubmissionsPage() {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) {
    redirect('/login')
  }

  const typedUser = user as User

  if (typedUser.role !== 'contributor') {
    redirect('/dashboard')
  }

  // Fetch all submissions (pending, approved, rejected)
  const submissions = await payload.find({
    collection: 'posts',
    where: {
      and: [
        { authors: { equals: typedUser.id } },
        {
          reviewStatus: {
            in: ['pending_review', 'approved', 'rejected'],
          },
        },
      ],
    },
    sort: '-submittedForReviewAt',
    limit: 50,
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_review':
        return (
          <Badge variant="outline" className="gap-1 border-yellow-500 text-yellow-700 dark:text-yellow-400">
            <Clock className="h-3 w-3" />
            Pending Review
          </Badge>
        )
      case 'approved':
        return (
          <Badge variant="outline" className="gap-1 border-green-500 text-green-700 dark:text-green-400">
            <CheckCircle2 className="h-3 w-3" />
            Approved
          </Badge>
        )
      case 'rejected':
        return (
          <Badge variant="outline" className="gap-1 border-red-500 text-red-700 dark:text-red-400">
            <XCircle className="h-3 w-3" />
            Needs Revision
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            {status}
          </Badge>
        )
    }
  }

  return (
    <div className="container max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Submissions</h1>
        <p className="text-muted-foreground mt-1">
          Track the review status of your submitted posts
        </p>
      </div>

      {submissions.docs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Submissions Yet</h3>
            <p className="text-muted-foreground mb-4">
              Submit your first post for review to see it here
            </p>
            <Button asChild>
              <Link href="/contributor/create">Create New Post</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {submissions.docs.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{post.title}</CardTitle>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span>
                        Submitted:{' '}
                        {post.submittedForReviewAt
                          ? formatDateTime(post.submittedForReviewAt)
                          : 'N/A'}
                      </span>
                      <span>•</span>
                      <span>Updated: {formatDateTime(post.updatedAt)}</span>
                    </div>
                  </div>
                  <div>{getStatusBadge(post.reviewStatus || 'draft')}</div>
                </div>
              </CardHeader>
              <CardContent>
                {post.reviewStatus === 'rejected' && post.editorFeedback && (
                  <div className="mb-4 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="font-semibold text-red-900 dark:text-red-100 mb-1 flex items-center gap-2">
                      <XCircle className="h-4 w-4" />
                      Editor Feedback
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {post.editorFeedback}
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  {post.reviewStatus === 'rejected' && (
                    <Button variant="default" size="sm" asChild>
                      <Link href={`/editor/posts/${post.id}/edit`}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit & Resubmit
                      </Link>
                    </Button>
                  )}
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/posts/${post.slug}`} target="_blank">
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
