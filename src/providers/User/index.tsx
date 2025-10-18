'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export interface User {
  id: string
  email: string
  name?: string
  role: 'contributor' | 'editor' | 'admin'
}

interface UserContextType {
  user: User | null
  loading: boolean
  refreshUser: () => Promise<void>
  clearUser: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const fetchUser = async () => {
    try {
      console.log('[UserProvider] Fetching user from /api/users/me')
      const response = await fetch('/api/users/me', {
        credentials: 'include',
        cache: 'no-store',
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('[UserProvider] User fetched successfully:', data.user)
        setUser(data.user)
      } else if (response.status === 401) {
        console.log('[UserProvider] 401 Unauthorized - user not logged in')
        const data = await response.json()
        
        // Handle session expiration
        if (data.sessionExpired && user !== null) {
          // Only show message if user was previously logged in
          setUser(null)
          
          // Don't redirect if already on login page
          if (!pathname.startsWith('/login') && !pathname.startsWith('/register')) {
            router.push('/login?message=Your session has expired. Please log in again.')
          }
        } else {
          setUser(null)
        }
      } else {
        console.log('[UserProvider] Unexpected response status:', response.status)
        setUser(null)
      }
    } catch (error) {
      // Silently fail - this is expected when not authenticated
      console.log('[UserProvider] Fetch error:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const refreshUser = async () => {
    setLoading(true)
    await fetchUser()
  }

  const clearUser = () => {
    setUser(null)
  }

  useEffect(() => {
    fetchUser()
    
    // Check session every 5 minutes
    const interval = setInterval(() => {
      fetchUser()
    }, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Refresh user when navigating to protected routes
  useEffect(() => {
    const protectedPaths = ['/dashboard', '/admin', '/editor']
    const authPaths = ['/login', '/register']
    
    const isProtectedRoute = protectedPaths.some(path => pathname.startsWith(path))
    const isAuthRoute = authPaths.some(path => pathname.startsWith(path))
    
    // Only refresh if navigating to protected route and not on auth page
    if (isProtectedRoute && !isAuthRoute && !loading) {
      console.log('[UserProvider] Navigated to protected route, refreshing user')
      fetchUser()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return (
    <UserContext.Provider value={{ user, loading, refreshUser, clearUser }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
