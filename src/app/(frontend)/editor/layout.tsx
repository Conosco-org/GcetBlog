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

  // Only editors can access the editor dashboard and its routes
  // Contributors should use their own dashboard
  if (typedUser.role !== 'editor') {
    redirect('/contributor')
  }

  // Get real counts for sidebar badges - parallelized
  const [pendingPosts, totalPosts, recentLogs, activeSubscribers] = await Promise.all([
    payload.count({
      collection: 'posts',
      where: { _status: { equals: 'draft' } },
    }),
    payload.count({ collection: 'posts' }),
    payload.count({
      collection: 'admin-logs',
      where: {
        createdAt: {
          greater_than: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
      },
    }),
    payload.count({
      collection: 'newsletter-subscribers',
      where: { status: { equals: 'active' } },
    }),
  ])

  return (
    <EditorLayoutClient
      user={typedUser}
      pendingPostsCount={pendingPosts.totalDocs}
      totalPostsCount={totalPosts.totalDocs}
      activityLogsCount={recentLogs.totalDocs}
      subscribersCount={activeSubscribers.totalDocs}
    >
      {children}
    </EditorLayoutClient>
  )
}
