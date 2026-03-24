import { getPayload, type Where } from 'payload'
import configPromise from '@payload-config'
import { Clock, MessageSquare, Calendar } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/base/PageHeader'
import { QueueTableClient } from './QueueTableClient'

// Force dynamic rendering - no caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

const PAGE_SIZE = 15

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>
}

export default async function EditorQueuePage({ searchParams }: PageProps) {
  const params = await searchParams
  const payload = await getPayload({ config: configPromise })

  const query = params.q || ''
  const page = Math.max(1, Number(params.page) || 1)

  // First, get all contributor user IDs using pagination to avoid hard limits
  const contributorIds: string[] = []
  let contributorsPage = 1
  let hasMoreContributors = true

  while (hasMoreContributors) {
    const contributors = await payload.find({
      collection: 'users',
      where: { role: { equals: 'contributor' } },
      limit: 100,
      page: contributorsPage,
    })

    contributorIds.push(...contributors.docs.map(user => user.id))

    // Continue until there are no more contributor pages
    if (!contributors.hasNextPage || !contributors.nextPage) {
      hasMoreContributors = false
    } else {
      contributorsPage = contributors.nextPage
    }
  }
  // Build where clause - only posts from contributors
  const baseConditions: Where[] = [
    { _status: { equals: 'draft' } },
    { reviewStatus: { equals: 'pending_review' } },
    { authors: { in: contributorIds } }, // Only posts authored by contributors
  ]

  if (query) {
    baseConditions.push({
      or: [
        { title: { like: query } },
      ] as Where[],
    })
  }

  const baseWhere: Where = { and: baseConditions }

  // Parallel queries
  const [pendingPosts, pendingComments, flaggedComments] = await Promise.all([
    payload.find({
      collection: 'posts',
      where: baseWhere,
      depth: 2,
      sort: '-submittedForReviewAt',
      limit: PAGE_SIZE,
      page,
    }),
    payload.count({
      collection: 'comments',
      where: { status: { equals: 'pending' } },
    }),
    payload.count({
      collection: 'comments',
      where: { status: { equals: 'reported' } },
    }),
  ])

  return (
    <div className="p-8 min-h-screen">
      <PageHeader
        title="Review Queue"
        description="Manage pending content and moderation tasks"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
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

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-muted-foreground text-sm font-medium mb-1">Scheduled Posts</p>
                <p className="text-4xl font-bold">0</p>
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
              className="px-6 py-4 text-sm font-medium text-primary border-b-2 border-primary"
            >
              Post Approvals ({pendingPosts.totalDocs})
            </Link>
            <Link
              href="/editor/comments"
              className="px-6 py-4 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-b-2 hover:border-muted-foreground transition-colors"
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

      {/* Posts Awaiting Review */}
      <QueueTableClient
        posts={pendingPosts.docs}
        totalPages={pendingPosts.totalPages}
        currentPage={pendingPosts.page || page}
        totalItems={pendingPosts.totalDocs}
        pageSize={PAGE_SIZE}
        query={query}
      />
    </div>
  )
}
