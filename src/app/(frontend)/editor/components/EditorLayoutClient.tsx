'use client'

import { useState } from 'react'
import { EditorSidebar } from './EditorSidebar'
import { Menu, X } from 'lucide-react'
import type { User } from '@/payload-types'

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
  children,
}: EditorLayoutClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Hamburger Button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
        aria-label="Toggle menu"
      >
        {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <EditorSidebar
        user={user}
        pendingPostsCount={pendingPostsCount}
        totalPostsCount={totalPostsCount}
        activityLogsCount={activityLogsCount}
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile top padding for hamburger button */}
        <div className="lg:hidden h-16" />
        {children}
      </main>
    </div>
  )
}
