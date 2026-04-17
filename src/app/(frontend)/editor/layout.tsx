import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import type { User } from '@/shared/types/payload-types'
import { EditorLayoutClient } from '@/frontend/features/editor/components/editor-layout-client'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Editor Dashboard',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function EditorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()

  // Authenticate the request
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) {
    redirect('/login')
  }

  const typedUser = user as User & { role: string }
  const isAdmin = Boolean((typedUser as unknown as Record<string, unknown>).isAdmin)

  // Only editors and admins can access the editor dashboard and its routes
  // Contributors should use their own dashboard
  if (typedUser.role !== 'editor' && !isAdmin) {
    redirect('/contributor')
  }

  // Get contributor IDs for filtering
  const contributors = await payload.find({
    collection: 'users',
    where: { role: { equals: 'contributor' } },
    limit: 1000,
  })
  const contributorIds = contributors.docs.map(u => u.id)

  // Get real counts for sidebar badges - parallelized
  const [pendingPostsFromContributors, publishedPosts, recentLogs] = await Promise.all([
    // Review Queue: Only posts from contributors with pending_review status
    payload.count({
      collection: 'posts',
      where: {
        and: [
          { _status: { equals: 'draft' } },
          { reviewStatus: { equals: 'pending_review' } },
          { authors: { in: contributorIds } },
        ],
      },
    }),
    // Content Manager: Only published posts
    payload.count({
      collection: 'posts',
      where: { _status: { equals: 'published' } },
    }),
    payload.count({
      collection: 'admin-logs',
      where: {
        createdAt: {
          greater_than: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
      },
    }),
  ])

  return (
    <EditorLayoutClient
      user={typedUser}
      pendingPostsCount={pendingPostsFromContributors.totalDocs}
      totalPostsCount={publishedPosts.totalDocs}
      activityLogsCount={recentLogs.totalDocs}
    >
      {children}
    </EditorLayoutClient>
  )
}
