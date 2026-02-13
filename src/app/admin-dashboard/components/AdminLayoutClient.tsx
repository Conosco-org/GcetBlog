'use client'

import { useState } from 'react'
import { AdminSidebar } from './AdminSidebar'
import { AdminHeader } from './AdminHeader'
import { Toaster } from '@/components/ui/toaster'
import type { User } from '@/payload-types'

interface AdminLayoutClientProps {
  user: User
  stats: {
    totalUsers: number
    totalPosts: number
    pendingReviews: number
    totalComments: number
    contributors: number
    editors: number
  }
  children: React.ReactNode
}

export function AdminLayoutClient({ user, stats, children }: AdminLayoutClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader
        user={user as User & { role: string }}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <div className="flex pt-16">
        <AdminSidebar user={user} stats={stats} isOpen={isSidebarOpen} />
        <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  )
}
