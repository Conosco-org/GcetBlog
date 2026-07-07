import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { ContributorLayoutClient } from '@frontend/features/contributor/components/contributor-layout-client'
import { PayloadBlocker } from '@frontend/features/contributor/components/payload-blocker'
import type { User } from '@shared/types/payload-types'
import React from 'react'
import type { Metadata } from 'next'
import { getActiveLifecycleWhere } from '@backend/lifecycle/service'

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
  const activeLifecycleWhere = getActiveLifecycleWhere()

  const [draftCount, submittedCount, publishedCount, feedbackCount] = await Promise.all([
    payload.count({
      collection: 'posts',
      where: { and: [authorWhere, activeLifecycleWhere, { _status: { equals: 'draft' } }] },
    }),
    payload.count({
      collection: 'posts',
      where: { and: [authorWhere, activeLifecycleWhere, { reviewStatus: { equals: 'pending_review' } }] },
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
    <>
      <PayloadBlocker />
      <ContributorLayoutClient user={typedUser} stats={stats}>{children}</ContributorLayoutClient>
    </>
  )
}
