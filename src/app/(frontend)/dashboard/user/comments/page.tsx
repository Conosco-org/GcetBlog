import { getPayload } from 'payload'
import config from '@payload-config'
import { UserCommentDashboard } from './UserCommentDashboard'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import type { User } from '@/shared/types/payload-types'
import { PageHeader } from '@frontend/components/base/PageHeader'

// Force dynamic rendering for real-time data
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function UserCommentsPage() {
  const payload = await getPayload({ config })
  const requestHeaders = await headers()

  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) {
    redirect('/login')
  }

  const typedUser = user as User

  // Fetch user's own comments
  const myComments = await payload.find({
    collection: 'comments',
    where: {
      author: { equals: typedUser.id },
    },
    sort: '-createdAt',
    limit: 100,
  })

  // Fetch comments reported by user
  const reportedComments = await payload.find({
    collection: 'comments',
    where: {
      reportedBy: { equals: typedUser.id },
    },
    sort: '-reportedAt',
    limit: 100,
  })

  return (
    <div className="container mx-auto p-8">
      <PageHeader
        title="My Comments"
        description="View and manage your comments and reports"
      />

      <UserCommentDashboard
        myComments={myComments.docs}
        reportedComments={reportedComments.docs}
        userId={typedUser.id}
      />
    </div>
  )
}
