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
import { Analytics } from '@vercel/analytics/next'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import '@/app/(frontend)/globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contributor Dashboard',
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
          { reviewStatus: { equals: 'pending_review' } },
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
    // Get feedback count for this contributor
    feedback: (await payload.find({
      collection: 'feedback',
      where: { contributor: { equals: typedUser.id } },
      limit: 0,
    })).totalDocs,
  }

  return (
    <html className={cn(GeistSans.variable, GeistMono.variable)} lang="en" suppressHydrationWarning>
      <head>
        <InitTheme />
        <link href="https://res.cloudinary.com/dqpvhbkdd/image/upload/b_white,c_pad,w_512,h_512/v1761577830/Gcet_Logo_i9fkbt.png" rel="icon" type="image/png" />
      </head>
      <body className="bg-background text-foreground antialiased" suppressHydrationWarning>
        <PayloadBlocker />
        <Providers>
          <ContributorLayoutClient user={typedUser} stats={stats}>{children}</ContributorLayoutClient>
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
