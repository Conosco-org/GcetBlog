import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import React from 'react'
import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import '@/app/(frontend)/globals.css'
import type { Metadata } from 'next'
import { PlatformSidebar } from '../platform/components/PlatformSidebar'

export const metadata: Metadata = {
  title: 'Platform Admin — GCET Blog',
}

export default async function PlatformRootLayout({ children }: { children: React.ReactNode }) {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) redirect('/login')

  const fullUser = await payload.findByID({
    collection: 'users',
    id: user.id,
    depth: 0,
  })

  if ((fullUser as { role?: string }).role !== 'superadmin') {
    // Not a superadmin — send them to their real dashboard
    const ra = (fullUser as { roleAssignments?: { assignedRole: string }[] }).roleAssignments ?? []
    const isInstAdmin = ra.some((a) => a.assignedRole === 'institution_admin')
    redirect(isInstAdmin ? '/user' : ra.length > 0 ? '/user' : '/')
  }

  return (
    <html className={cn(GeistSans.variable, GeistMono.variable)} lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased" suppressHydrationWarning>
        <InitTheme />
        <Providers>
          <div className="flex min-h-screen">
            <PlatformSidebar user={fullUser as { name?: string; email?: string; role?: string }} />
            <main className="flex-1 overflow-auto">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  )
}
