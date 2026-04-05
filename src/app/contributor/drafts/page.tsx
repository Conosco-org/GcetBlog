import { getPayload, type Where } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { User } from '@/payload-types'
import { Button } from '@/components/ui/button'
import { FileText } from 'lucide-react'
import { PageHeader } from '@/components/base/PageHeader'
import { DraftsGridClient } from './DraftsGridClient'

const PAGE_SIZE = 12

// Force dynamic rendering for real-time data
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>
}

export default async function DraftsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) {
    redirect('/login')
  }

  const typedUser = user as User

  if (typedUser.role !== 'contributor') {
    redirect('/dashboard')
  }

  const query = params.q || ''
  const page = Math.max(1, Number(params.page) || 1)

  const conditions: Where[] = [
    { authors: { equals: typedUser.id } },
    { 
      or: [
        { reviewStatus: { equals: 'draft' } },
        { reviewStatus: { equals: 'rejected' } },
        { reviewStatus: { equals: 'pending_review' } },
      ]
    },
  ]

  if (query) {
    conditions.push({ title: { like: query } })
  }

  const drafts = await payload.find({
    collection: 'posts',
    where: { and: conditions },
    sort: '-updatedAt',
    limit: PAGE_SIZE,
    page,
  })

  // Fetch unread rejection notifications for this contributor
  const rejections = await payload.find({
    collection: 'rejection-notifications',
    where: {
      and: [
        { contributor: { equals: typedUser.id } },
        { isRead: { equals: false } },
      ],
    },
    sort: '-createdAt',
    limit: 50,
  })

  return (
    <div className="container max-w-6xl mx-auto p-6">
      <PageHeader
        title="My Drafts"
        description="Continue working on your unfinished posts"
        action={
          <Button asChild>
            <Link href="/contributor/create">
              <FileText className="h-4 w-4 mr-2" />
              New Draft
            </Link>
          </Button>
        }
      />

      <div className="mt-6">
        <DraftsGridClient
          drafts={drafts.docs}
          rejections={rejections.docs}
          totalPages={drafts.totalPages}
          currentPage={drafts.page || page}
          totalItems={drafts.totalDocs}
          pageSize={PAGE_SIZE}
          query={query}
        />
      </div>
    </div>
  )
}
