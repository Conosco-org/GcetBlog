import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import type { User } from '@/payload-types'
import { EditorSidebar } from './components/EditorSidebar'

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

  // Only editors and admins can access this page
  if (typedUser.role !== 'editor' && typedUser.role !== 'admin') {
    redirect('/')
  }

  // Get real counts for sidebar badges
  const pendingPosts = await payload.count({
    collection: 'posts',
    where: {
      _status: {
        equals: 'draft',
      },
    },
  })

  const totalPosts = await payload.count({
    collection: 'posts',
  })

  const recentLogs = await payload.count({
    collection: 'admin-logs',
    where: {
      createdAt: {
        greater_than: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Last 7 days
      },
    },
  })

  return (
    <div className="flex min-h-screen bg-background">
      <EditorSidebar 
        user={typedUser}
        pendingPostsCount={pendingPosts.totalDocs}
        totalPostsCount={totalPosts.totalDocs}
        activityLogsCount={recentLogs.totalDocs}
      />
      <main className="flex-1 overflow-y-auto">
        {/* Top padding for hamburger button */}
        <div className="h-16" />
        {children}
      </main>
    </div>
  )
}
