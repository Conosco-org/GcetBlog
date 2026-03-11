import { redirect } from 'next/navigation'

// Force dynamic rendering for real-time data
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function FeedbackCenterPage() {
  // Contributor routes deprecated - redirect to editor
  redirect('/editor')
}
