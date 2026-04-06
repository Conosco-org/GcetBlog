'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { ContributorSidebar } from './contributor-sidebar'
import { ContributorHeader } from './contributor-header'
import { Toaster } from '@frontend/components/ui/toaster'
import { NavigationProgressProvider } from '@frontend/providers'
import type { User } from '@shared/types/payload-types'

interface ContributorLayoutClientProps {
  user: User
  stats: {
    drafts: number
    submissions: number
    published: number
    feedback: number
  }
  children: React.ReactNode
}

export function ContributorLayoutClient({ user, stats, children }: ContributorLayoutClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const pathname = usePathname()

  // Auto-close sidebar on mobile on initial load & resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Close mobile sidebar on route change
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false)
    }
  }, [pathname])

  return (
    <NavigationProgressProvider>
      <div className="min-h-screen bg-background">
        <ContributorHeader 
          user={user as User & { role: string }} 
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <div className="flex pt-16">
          {/* Mobile backdrop */}
          {isSidebarOpen && (
            <div
              className="fixed inset-0 z-20 bg-black/50 md:hidden"
              onClick={() => setIsSidebarOpen(false)}
              aria-hidden="true"
            />
          )}
          <ContributorSidebar user={user} stats={stats} isOpen={isSidebarOpen} />
          <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
            {children}
          </main>
        </div>
        <Toaster />
      </div>
    </NavigationProgressProvider>
  )
}
