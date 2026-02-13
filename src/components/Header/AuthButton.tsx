'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LogoutButton } from '@/components/LogoutButton'
import { useUser } from '@/providers/User'

export function AuthButton() {
  const { user, loading } = useUser()

  if (loading) {
    return (
      <div className="w-24 h-10 bg-gray-200 animate-pulse rounded"></div>
    )
  }

  if (user) {
    const isAdmin = Boolean((user as unknown as { isAdmin?: boolean }).isAdmin)
    const dashboardUrl = 
      isAdmin ? '/admin-dashboard' :
      user.role === 'editor' ? '/editor' :
      '/dashboard'

    const dashboardLabel = 
      isAdmin ? 'Admin Dashboard' :
      user.role === 'editor' ? 'Editor Dashboard' :
      'Dashboard'

    return (
      <div className="flex items-center gap-3">
        <Link href={dashboardUrl}>
          <Button variant="default" size="sm">
            {dashboardLabel}
          </Button>
        </Link>
        <LogoutButton className="text-sm" />
      </div>
    )
  }

  return (
    <Link href="/login">
      <Button variant="default" size="sm">
        Sign In
      </Button>
    </Link>
  )
}
