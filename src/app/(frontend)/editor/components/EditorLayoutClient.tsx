'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { EditorSidebar } from './EditorSidebar'
import { EditorHeader } from './EditorHeader'
import { Toaster } from '@/components/ui/toaster'
import { NavigationProgressProvider } from '@/providers/NavigationProgress'
import type { User } from '@/payload-types'

interface EditorLayoutClientProps {
  user: User & { role: string }
  pendingPostsCount: number
  totalPostsCount: number
  activityLogsCount: number
  subscribersCount: number
  children: React.ReactNode
}

export function EditorLayoutClient({
  user,
  pendingPostsCount,
  totalPostsCount,
  activityLogsCount,
  subscribersCount,
  children
}: EditorLayoutClientProps) {
  const [isOpen, setIsOpen] = useState(true)
  const pathname = usePathname()

  // Auto-close sidebar on mobile when navigating
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsOpen(false)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Close mobile sidebar on route change
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsOpen(false)
    }
  }, [pathname])

  return (
    <NavigationProgressProvider>
      <div className="flex flex-col min-h-screen bg-background">
        <EditorHeader 
          user={user}
          isOpen={isOpen}
          onToggle={() => setIsOpen(!isOpen)}
        />

        <div className="flex flex-1">
          {/* Mobile backdrop */}
          {isOpen && (
            <div
              className="fixed inset-0 z-20 bg-black/50 md:hidden"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />
          )}
          <EditorSidebar 
            user={user}
            pendingPostsCount={pendingPostsCount}
            totalPostsCount={totalPostsCount}
            activityLogsCount={activityLogsCount}
            subscribersCount={subscribersCount}
            isOpen={isOpen}
            _onToggle={() => setIsOpen(false)}
          />
          <main className={`flex-1 overflow-y-auto transition-all duration-200 ${isOpen ? 'md:ml-64' : 'ml-0'}`}>
            {children}
          </main>
        </div>
        <Toaster />
      </div>
    </NavigationProgressProvider>
  )
}
