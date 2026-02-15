'use client'

import { useState } from 'react'
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

  return (
    <NavigationProgressProvider>
      <div className="flex flex-col min-h-screen bg-background">
        <EditorHeader 
          user={user}
          isOpen={isOpen}
          onToggle={() => setIsOpen(!isOpen)}
        />

        <div className="flex flex-1">
          <EditorSidebar 
            user={user}
            pendingPostsCount={pendingPostsCount}
            totalPostsCount={totalPostsCount}
            activityLogsCount={activityLogsCount}
            subscribersCount={subscribersCount}
            isOpen={isOpen}
            _onToggle={() => setIsOpen(!isOpen)}
          />
          <main className={`flex-1 overflow-y-auto transition-all duration-200 ${isOpen ? 'ml-64' : 'ml-0'}`}>
            {children}
          </main>
        </div>
        <Toaster />
      </div>
    </NavigationProgressProvider>
  )
}
