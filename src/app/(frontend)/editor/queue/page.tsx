import { getPayload, type Where } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { Archive, Clock, MessageSquare } from 'lucide-react'
import { Card, CardContent } from '@/frontend/components/ui/card'
import { PageHeader } from '@frontend/components/base/PageHeader'
import { QueueTabs } from './QueueTabs'
import { getActiveArchiveWhere, getArchiveConfig } from '@backend/archive/service'

// Force dynamic rendering - no caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string; limit?: string; tab?: string }>
}

export default async function EditorQueuePage({ searchParams }: PageProps) {
  const params = await searchParams
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })
  const typedUser = user as { role?: string; isAdmin?: boolean } | null
  const isAdmin = typedUser?.role === 'admin' || typedUser?.isAdmin === true

  const query = params.q || ''
  const page = Math.max(1, Number(params.page) || 1)
  const limit = Math.max(10, Math.min(100, Number(params.limit) || 10))
  const activeTab = params.tab || 'posts'

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
    { authors: { in: contributorIds } },
    getActiveArchiveWhere(),
  ]

  if (query) {
    baseConditions.push({
      or: [
        { title: { like: query } },
      ] as Where[],
    })
  }

  const baseWhere: Where = { and: baseConditions }
  const archivedPostsPromise = payload.find({
    collection: 'archived-posts',
    depth: 2,
    limit,
    page,
    sort: '-archivedAt',
  }).catch(() => ({
    docs: [],
    totalDocs: 0,
    totalPages: 0,
    page,
    limit,
    hasPrevPage: false,
    hasNextPage: false,
  }))
  const archivedCommentsPromise = payload.find({
    collection: 'archived-comments',
    depth: 2,
    limit,
    page,
    sort: '-archivedAt',
  }).catch(() => ({
    docs: [],
    totalDocs: 0,
    totalPages: 0,
    page,
    limit,
    hasPrevPage: false,
    hasNextPage: false,
  }))

  // Parallel queries
  const [pendingPosts, pendingComments, archivedPosts, archivedComments, archiveConfig] = await Promise.all([
    payload.find({
      collection: 'posts',
      where: baseWhere,
      depth: 2,
      sort: '-submittedForReviewAt',
      limit,
      page,
      draft: true,
    }),
    payload.find({
      collection: 'comments',
      where: { status: { equals: 'pending' } },
      depth: 2,
      limit,
      page,
      sort: '-createdAt',
    }),
    archivedPostsPromise,
    archivedCommentsPromise,
    getArchiveConfig(payload),
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
                <p className="text-muted-foreground text-sm font-medium mb-1">Archived Items</p>
                <p className="text-4xl font-bold">{archivedPosts.totalDocs + archivedComments.totalDocs}</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center">
                <Archive className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Component */}
      <QueueTabs
        activeTab={activeTab}
        pendingPostsCount={pendingPosts.totalDocs}
        pendingCommentsCount={pendingComments.totalDocs}
        archivedItemsCount={archivedPosts.totalDocs + archivedComments.totalDocs}
        posts={pendingPosts}
        pendingComments={pendingComments}
        archivedPosts={archivedPosts}
        archivedComments={archivedComments}
        archiveConfig={archiveConfig}
        isAdmin={isAdmin}
        query={query}
      />
    </div>
  )
}
