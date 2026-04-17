import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import type { User } from '@/shared/types/payload-types'

export default async function DashboardPage() {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })
  
  if (!user) {
    redirect('/login')
  }

  const typedUser = user as User

  // Redirect based on user role and admin flag
  const isAdmin = Boolean((typedUser as unknown as Record<string, unknown>).isAdmin)
  if (isAdmin) {
    redirect('/admin-dashboard')
  } else if (typedUser.role === 'editor') {
    redirect('/editor')
  } else if (typedUser.role === 'contributor') {
    redirect('/contributor')
  } else {
    // Default user - show basic dashboard
    redirect('/dashboard/user')
  }
}
