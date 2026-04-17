'use client'

import { createContext, useCallback, useEffect, useState } from 'react'

interface User {
  id: string
  email: string
  name?: string
  role: 'contributor' | 'editor'
  isAdmin?: boolean
  canManageAdmins?: boolean
}

interface AuthContextType {
  user: User | null
  loading: boolean
  refreshUser: () => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  const logout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' })
      if (response.ok) {
        setUser(null)
        window.location.href = '/login'
      }
    } catch {
      // Silently fail - logout will still redirect
    }
  }

  const fetchUser = useCallback(async () => {
    if (!mounted) return

    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
        cache: 'no-store',
      })
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        setUser(null)
      }
    } catch {
      // Silently fail - this is expected when not authenticated
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [mounted])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      fetchUser()
    }
  }, [mounted, fetchUser])

  // Prevent hydration mismatch by not rendering auth-dependent content until mounted
  if (!mounted) {
    return (
      <AuthContext.Provider value={{ user: null, loading: true, refreshUser: fetchUser, logout }}>
        {children}
      </AuthContext.Provider>
    )
  }

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser: fetchUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
