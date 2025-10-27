import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { ContributorLayoutClient } from './components/ContributorLayoutClient'
import { PayloadBlocker } from './components/PayloadBlocker'
import type { User } from '@/payload-types'
import React from 'react'
import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import '@/app/(frontend)/globals.css'

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

  // Fetch badge counts for sidebar
  const [draftPosts, submittedPosts, publishedPosts] = await Promise.all([
    // Drafts count
    payload.find({
      collection: 'posts',
      where: {
        and: [
          { authors: { equals: typedUser.id } },
          { _status: { equals: 'draft' } },
        ],
      },
      limit: 0,
    }),
    // Submissions (under review) count
    payload.find({
      collection: 'posts',
      where: {
        and: [
          { authors: { equals: typedUser.id } },
          { reviewStatus: { equals: 'pending' } },
        ],
      },
      limit: 0,
    }),
    // Published posts count
    payload.find({
      collection: 'posts',
      where: {
        and: [
          { authors: { equals: typedUser.id } },
          { _status: { equals: 'published' } },
        ],
      },
      limit: 0,
    }),
  ])

  const stats = {
    drafts: draftPosts.totalDocs,
    submissions: submittedPosts.totalDocs,
    published: publishedPosts.totalDocs,
    // Feedback is typically comments or reviews - for now set to 0
    feedback: 0,
  }

  return (
    <html className={cn(GeistSans.variable, GeistMono.variable)} lang="en" suppressHydrationWarning>
      <head>
        <InitTheme />
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
      </head>
      <body className="bg-background text-foreground antialiased" suppressHydrationWarning>
        <PayloadBlocker />
        <Providers>
          <ContributorLayoutClient user={typedUser} stats={stats}>{children}</ContributorLayoutClient>
        </Providers>
      </body>
    </html>
  )
}
