'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { LogoutButton } from '@/components/LogoutButton'
import { useUser } from '@/providers/User'
import { Loader2, LayoutDashboard, LogIn } from 'lucide-react'

export function AuthButton() {
  const { user, loading } = useUser()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isNavigating, setIsNavigating] = useState(false)

  if (loading) {
    return (
      <div className="w-24 h-10 bg-gray-200 animate-pulse rounded"></div>
    )
  }

  if (user) {
    const isSuperAdmin = user.role === 'superadmin'
    const isInstAdmin = user.roleAssignments?.some(a => a.assignedRole === 'institution_admin') ?? false
    const hasRoles = (user.roleAssignments?.length ?? 0) > 0

    const dashboardUrl = 
      isSuperAdmin ? '/platform' :
      isInstAdmin ? '/admin-dashboard' :
      hasRoles ? '/editor' :
      '/'

    const dashboardLabel = 
      isSuperAdmin ? 'Platform Admin' :
      isInstAdmin ? 'Admin Dashboard' :
      hasRoles ? 'Editor Dashboard' :
      'Home'

    return (
      <div className="flex items-center gap-2 sm:gap-3">
        <Link href={dashboardUrl}>
          <Button variant="default" size="sm" title={dashboardLabel} aria-label={dashboardLabel}>
            <LayoutDashboard className="w-4 h-4 sm:mr-1.5" />
            <span className="hidden sm:inline">{dashboardLabel}</span>
          </Button>
        </Link>
        <LogoutButton className="text-sm" />
      </div>
    )
  }

  const handleSignIn = () => {
    setIsNavigating(true)
    startTransition(() => {
      router.push('/login')
    })
  }

  return (
    <Button 
      variant="default" 
      size="sm"
      onClick={handleSignIn}
      disabled={isPending || isNavigating}
    >
      {isPending || isNavigating ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          <LogIn className="w-4 h-4 sm:mr-1.5" />
          <span className="hidden sm:inline">Sign In</span>
        </>
      )}
    </Button>
  )
}
