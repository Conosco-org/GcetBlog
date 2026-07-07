import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * Legacy admin dashboard route - redirects to the new /admin-dashboard.
 */
export default async function AdminDashboardPage() {
  redirect('/admin-dashboard')
}
