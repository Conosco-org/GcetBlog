'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useUser } from '@/providers/User'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function LogoutButton({ className = '' }: { className?: string }) {
  const router = useRouter()
  const { clearUser } = useUser()
  const [loading, setLoading] = useState(false)
  
  const handleLogout = async () => {
    setLoading(true)
    try {
      // Clear user context immediately for faster UI response
      clearUser()
      
      // Call logout API
      await fetch('/api/auth/logout', { method: 'POST' })
      
      // Redirect to login
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
      // Still redirect even if API fails (cookie might be expired)
      router.push('/login')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <Button
      onClick={handleLogout}
      disabled={loading}
      variant="destructive"
      className={`w-full ${className}`}
      title="Sign out"
      aria-label="Sign out"
    >
      <LogOut className="w-4 h-4 sm:mr-2" />
      <span className="hidden sm:inline">{loading ? 'Logging out...' : 'Logout'}</span>
    </Button>
  )
}
