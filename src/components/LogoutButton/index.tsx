'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function LogoutButton({ className = '' }: { className?: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const handleLogout = async () => {
    setLoading(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={`px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? 'Logging out...' : 'Logout'}
    </button>
  )
}
