import { getPayload, type Where } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import type { User } from '@/payload-types'
import { PageHeader } from '@/components/base/PageHeader'
import { SubmissionsClient } from './SubmissionsClient'

const PAGE_SIZE = 10

// Force dynamic rendering for real-time data
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string; status?: string }>
}

export default async function SubmissionsPage({ searchParams }: PageProps) {
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
  const statusFilter = params.status || ''

  // Build where - show all submitted posts (pending, approved, and posts with feedback)
  const conditions: Where[] = [
    { authors: { equals: typedUser.id } },
  ]

  if (statusFilter) {
    if (statusFilter === 'requesting_changes') {
      // Posts with editor feedback
      conditions.push({ 
        reviewStatus: { equals: 'draft' },
        editorFeedback: { exists: true }
      })
    } else {
      conditions.push({ reviewStatus: { equals: statusFilter } })
    }
  } else {
    // Show all submitted posts: pending review, approved, or with feedback
    conditions.push({
      or: [
        { reviewStatus: { equals: 'pending_review' } },
        { reviewStatus: { equals: 'approved' } },
        { 
          and: [
            { reviewStatus: { equals: 'draft' } },
            { editorFeedback: { exists: true } }
          ]
        }
      ]
    })
  }

  if (query) {
    conditions.push({ title: { like: query } })
  }

  const submissions = await payload.find({
    collection: 'posts',
    where: { and: conditions },
    sort: '-submittedForReviewAt',
    limit: PAGE_SIZE,
    page,
  })

  return (
    <div className="container max-w-6xl mx-auto p-6">
      <PageHeader
        title="My Submissions"
        description="Track the review status of your submitted posts"
      />

      <div className="mt-6">
        <SubmissionsClient
          submissions={submissions.docs}
          totalPages={submissions.totalPages}
          currentPage={submissions.page || page}
          totalItems={submissions.totalDocs}
          pageSize={PAGE_SIZE}
          query={query}
          statusFilter={statusFilter}
        />
      </div>
    </div>
  )
}
