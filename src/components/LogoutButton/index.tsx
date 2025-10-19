'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useUser } from '@/providers/User'
import { LogOut } from 'lucide-react'

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
    <button
      onClick={handleLogout}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
      title="Sign out"
    >
      <LogOut className="w-4 h-4" />
      <span>{loading ? 'Logging out...' : 'Logout'}</span>
    </button>
  )
}
