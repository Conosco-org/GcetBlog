'use client'

import { useState } from 'react'
import { ContributorSidebar } from './ContributorSidebar'
import { ContributorHeader } from './ContributorHeader'
import { Toaster } from '@/components/ui/toaster'
import { NavigationProgressProvider } from '@/providers/NavigationProgress'
import type { User } from '@/payload-types'

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

  return (
    <NavigationProgressProvider>
      <div className="min-h-screen bg-background">
        <ContributorHeader 
          user={user as User & { role: string }} 
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <div className="flex pt-16">
          <ContributorSidebar user={user} stats={stats} isOpen={isSidebarOpen} />
          <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
            {children}
          </main>
        </div>
        <Toaster />
      </div>
    </NavigationProgressProvider>
  )
}
