'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { LogoutButton } from '@/components/LogoutButton'
import { useUser } from '@/providers/User'
import { Loader2 } from 'lucide-react'

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
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Loading...
        </>
      ) : (
        'Sign In'
      )}
    </Button>
  )
}
