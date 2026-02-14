import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import type { User, Feedback } from '@/payload-types'
import FeedbackCenter from './FeedbackCenter'

// Force dynamic rendering for real-time data
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function FeedbackCenterPage() {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) {
    redirect('/login')
  }

  const typedUser = user as User & { role: string }

  // Only contributors can access this page
  if (typedUser.role !== 'contributor') {
    redirect('/dashboard')
  }

  // Fetch feedback for this contributor
  const feedback = await payload.find({
    collection: 'feedback',
    where: {
      contributor: { equals: user.id },
    },
    depth: 3, // Populate relationships
    sort: '-createdAt',
    limit: 100,
  })

  // Get stats for the overview cards
  const feedbackDocs = feedback.docs as Feedback[]
  const stats = {
    critical: feedbackDocs.filter(f => f.type === 'critical').length,
    suggestions: feedbackDocs.filter(f => f.type === 'suggestions').length,
    praise: feedbackDocs.filter(f => f.type === 'praise').length,
    questions: feedbackDocs.filter(f => f.type === 'questions').length,
  }

  return (
    <FeedbackCenter 
      feedback={feedbackDocs}
      stats={stats}
      user={typedUser}
    />
  )
}