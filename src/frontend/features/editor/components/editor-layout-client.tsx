'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { EditorSidebar } from './editor-sidebar'
import { EditorHeader } from './editor-header'
import { Toaster } from '@frontend/components/ui/toaster'
import { NavigationProgressProvider } from '@frontend/providers'
import type { User } from '@shared/types/payload-types'

interface EditorLayoutClientProps {
  user: User & { role: string }
  pendingPostsCount: number
  totalPostsCount: number
  activityLogsCount: number
  children: React.ReactNode
}

export function EditorLayoutClient({
  user,
  pendingPostsCount,
  totalPostsCount,
  activityLogsCount,
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
          {/* Show sidebar for editors and admins */}
          {(user.role === 'editor' || user.role === 'admin' || (user as unknown as { isAdmin?: boolean }).isAdmin) && (
            <>
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
                isOpen={isOpen}
                _onToggle={() => setIsOpen(false)}
              />
            </>
          )}
          <main className={`flex-1 overflow-y-auto transition-all duration-200 ${((user.role === 'editor' || user.role === 'admin' || (user as unknown as { isAdmin?: boolean }).isAdmin) && isOpen) ? 'md:ml-64' : 'ml-0'}`}>
            {children}
          </main>
        </div>
        <Toaster />
      </div>
    </NavigationProgressProvider>
  )
}
