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
  title: 'Admin Dashboard',
  icons: {
    icon: 'https://res.cloudinary.com/dqpvhbkdd/image/upload/b_white,c_pad,w_512,h_512/v1761577830/Gcet_Logo_i9fkbt.png',
  },
}

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) {
    redirect('/login')
  }

  // Fetch full user data to check roleAssignments
  const fullUser = await payload.findByID({
    collection: 'users',
    id: user.id,
    depth: 0,
  })

  // Only allow institution_admin or superadmin to access this area
  const isSuperAdmin = fullUser.role === 'superadmin'
  const isInstAdmin = Array.isArray((fullUser as unknown as Record<string, unknown>).roleAssignments) &&
    (fullUser as unknown as { roleAssignments: Array<{ assignedRole: string }> }).roleAssignments
      .some((a) => a.assignedRole === 'institution_admin')

  if (!isSuperAdmin && !isInstAdmin) {
    // Redirect to editor if they have any roles, otherwise home
    const hasRoles = Array.isArray((fullUser as unknown as Record<string, unknown>).roleAssignments) &&
      ((fullUser as unknown as { roleAssignments: unknown[] }).roleAssignments.length > 0)
    redirect(hasRoles ? '/editor' : '/')
  }

  // Fetch counts for sidebar badges - parallelized
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
    <html className={cn(GeistSans.variable, GeistMono.variable)} lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased" suppressHydrationWarning>
        <InitTheme />
        <PayloadBlocker />
        <Providers>
          <EditorLayoutClient
            user={fullUser as any}
            pendingPostsCount={pendingPosts.totalDocs}
            totalPostsCount={totalPosts.totalDocs}
            activityLogsCount={recentLogs.totalDocs}
            subscribersCount={0}
          >
            {children}
          </EditorLayoutClient>
        </Providers>
      </body>
    </html>
  )
}
