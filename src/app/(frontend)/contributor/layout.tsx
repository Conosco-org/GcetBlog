import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { ContributorLayoutClient } from '@frontend/features/contributor/components/contributor-layout-client'
import { PayloadBlocker } from '@frontend/features/contributor/components/payload-blocker'
import type { User } from '@shared/types/payload-types'
import React from 'react'
import { cn } from '@frontend/lib/utils'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import { Providers } from '@/frontend/providers'
import { InitTheme } from '@/frontend/providers/Theme/InitTheme'
import '@/frontend/styles/globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contributor Dashboard',
  robots: {
    index: false,
    follow: false,
  },
  icons: {
    icon: 'https://res.cloudinary.com/dqpvhbkdd/image/upload/b_white,c_pad,w_512,h_512/v1761577830/Gcet_Logo_i9fkbt.png',
  },
}

export default async function ContributorLayout({
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

  const typedUser = user as User

  // Only allow contributors to access this area
  if (typedUser.role !== 'contributor') {
    redirect('/dashboard')
  }

  // Fetch badge counts for sidebar - use count() for efficiency
  const authorWhere = { authors: { equals: typedUser.id } }

  const [draftCount, submittedCount, publishedCount, feedbackCount] = await Promise.all([
    payload.count({
      collection: 'posts',
      where: { ...authorWhere, _status: { equals: 'draft' } },
    }),
    payload.count({
      collection: 'posts',
      where: { ...authorWhere, reviewStatus: { equals: 'pending_review' } },
    }),
    payload.count({
      collection: 'posts',
      where: { ...authorWhere, _status: { equals: 'published' } },
    }),
    payload.count({
      collection: 'feedback',
      where: { contributor: { equals: typedUser.id } },
    }),
  ])

  const stats = {
    drafts: draftCount.totalDocs,
    submissions: submittedCount.totalDocs,
    published: publishedCount.totalDocs,
    feedback: feedbackCount.totalDocs,
  }

  return (
    <html className={cn(GeistSans.variable, GeistMono.variable)} lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased" suppressHydrationWarning>
        <InitTheme />
        <PayloadBlocker />
        <Providers>
          <ContributorLayoutClient user={typedUser} stats={stats}>{children}</ContributorLayoutClient>
        </Providers>
      </body>
    </html>
  )
}
