import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { EditorLayoutClient } from '../(frontend)/editor/components/EditorLayoutClient'
import { PayloadBlocker } from '../contributor/components/PayloadBlocker'
import React from 'react'
import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import '@/app/(frontend)/globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard',
  icons: {
    icon: 'https://res.cloudinary.com/dqpvhbkdd/image/upload/b_white,c_pad,w_512,h_512/v1761577830/Gcet_Logo_i9fkbt.png',
  },
}

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) {
    redirect('/login')
  }

  // Superadmin belongs in /platform, not here
  if ((user as { role?: string }).role === 'superadmin') {
    redirect('/platform')
  }

  const fullUser = await payload.findByID({
    collection: 'users',
    id: user.id,
    depth: 0,
  })

  type FullUser = typeof fullUser & {
    roleAssignments?: Array<{ assignedRole: string }>
  }

  const roleAssignments = (fullUser as FullUser).roleAssignments ?? []

  // Must have at least one role assignment to use this workspace
  if (roleAssignments.length === 0) {
    redirect('/')
  }

  // Sidebar badge counts — parallelized
  const [pendingPosts, totalPosts, recentLogs, activeSubscribers] = await Promise.all([
    payload.count({ collection: 'posts', where: { _status: { equals: 'draft' } } }),
    payload.count({ collection: 'posts' }),
    payload.count({
      collection: 'admin-logs',
      where: { createdAt: { greater_than: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() } },
    }),
    payload.count({ collection: 'newsletter-subscribers', where: { status: { equals: 'active' } } }),
  ])

  // Map to SidebarUser shape (EditorLayoutClient expects this exact type)
  const sidebarUser = {
    id: String(fullUser.id),
    role: ((fullUser as FullUser).role ?? 'user') as 'superadmin' | 'user',
    name: fullUser.name ?? undefined,
    email: fullUser.email ?? undefined,
    institution: fullUser.institution
      ? (typeof fullUser.institution === 'string'
          ? fullUser.institution
          : { id: String((fullUser.institution as { id: unknown }).id) })
      : undefined,
    roleAssignments: roleAssignments as Array<{
      assignedRole: import('@/access/permissions').AssignableRole
      scopeType: string
      scopeId?: string | { id: string }
      scopeLabel?: string
    }>,
  }

  return (
    <html className={cn(GeistSans.variable, GeistMono.variable)} lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased" suppressHydrationWarning>
        <InitTheme />
        <PayloadBlocker />
        <Providers>
          <EditorLayoutClient
            user={sidebarUser as React.ComponentProps<typeof EditorLayoutClient>['user']}
            pendingPostsCount={pendingPosts.totalDocs}
            totalPostsCount={totalPosts.totalDocs}
            activityLogsCount={recentLogs.totalDocs}
            subscribersCount={activeSubscribers.totalDocs}
          >
            {children}
          </EditorLayoutClient>
        </Providers>
      </body>
    </html>
  )
}
