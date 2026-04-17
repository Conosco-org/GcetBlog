import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import type { User } from '@shared/types/payload-types'
import FeedbackCenter from '@frontend/features/contributor/components/feedback-center'

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

  return <FeedbackCenter />
}
