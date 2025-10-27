'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { EditorSidebar } from './EditorSidebar'
import type { User } from '@/payload-types'

interface MobileMenuButtonProps {
  user: User & { role: string }
  pendingPostsCount: number
  totalPostsCount: number
  activityLogsCount: number
}

export function MobileMenuButton({
  user,
  pendingPostsCount,
  totalPostsCount,
  activityLogsCount,
}: MobileMenuButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <EditorSidebar
        user={user}
        pendingPostsCount={pendingPostsCount}
        totalPostsCount={totalPostsCount}
        activityLogsCount={activityLogsCount}
        isOpen={isOpen}
        onToggle={() => setIsOpen(false)}
      />
    </>
  )
}
