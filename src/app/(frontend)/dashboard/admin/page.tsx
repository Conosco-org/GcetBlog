import { redirect } from 'next/navigation'

/**
 * Legacy admin dashboard route — redirects to the new /admin-dashboard.
 */
export default async function AdminDashboardPage() {
  redirect('/admin-dashboard')
}
