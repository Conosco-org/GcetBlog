import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import type { User } from '@/payload-types'
import { EditorLayoutClient } from './components/EditorLayoutClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Editor Dashboard',
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

  // Only editors can access this page (admins are editors with isAdmin=true)
  if (typedUser.role !== 'editor') {
    redirect('/')
  }

  // Get real counts for sidebar badges — parallelized
  const [pendingPosts, totalPosts, recentLogs] = await Promise.all([
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
  ])

  return (
    <EditorLayoutClient
      user={typedUser}
      pendingPostsCount={pendingPosts.totalDocs}
      totalPostsCount={totalPosts.totalDocs}
      activityLogsCount={recentLogs.totalDocs}
    >
      {children}
    </EditorLayoutClient>
  )
}
