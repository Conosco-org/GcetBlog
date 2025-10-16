'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { LogoutButton } from '@/components/LogoutButton'

interface User {
  id: string
  email: string
  name?: string
  role: 'contributor' | 'editor' | 'admin'
}

export function AuthButton() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/users/me', {
      credentials: 'include',
    })
      .then((res) => {
        if (res.ok) return res.json()
        return null
      })
      .then((data) => {
        if (data?.user) {
          setUser(data.user)
        }
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="w-24 h-10 bg-gray-200 animate-pulse rounded"></div>
    )
  }

  if (user) {
    const dashboardUrl = 
      user.role === 'admin' ? '/admin' :
      user.role === 'editor' ? '/editor' :
      '/dashboard'

    const dashboardLabel = 
      user.role === 'admin' ? 'Admin Dashboard' :
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
