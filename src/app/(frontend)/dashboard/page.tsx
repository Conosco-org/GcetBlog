import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import type { User } from '@/payload-types'

export default async function DashboardPage() {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })
  
  if (!user) {
    redirect('/login')
  }

  const typedUser = user as unknown as { id: string; role: string; roleAssignments?: { assignedRole: string }[] }

  // Redirect based on user role assignments
  if (typedUser.role === 'superadmin') {
    redirect('/admin-dashboard')
  } else if (typedUser.roleAssignments?.some(a => a.assignedRole === 'institution_admin')) {
    redirect('/admin-dashboard')
  } else if (typedUser.roleAssignments?.length) {
    redirect('/editor')
  } else {
    // Default user - show basic dashboard
    redirect('/dashboard/user')
  }
}
