'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/utilities/ui'
import { LayoutDashboard, Calendar, Users2, Trophy } from 'lucide-react'

interface ClubNavProps {
  slug: string
  /** Hide tabs that have no content */
  hasEvents?: boolean
  hasTeam?: boolean
  hasAchievements?: boolean
}

const tabs = [
  { label: 'Overview', href: '', icon: LayoutDashboard },
  { label: 'Events', href: '/events', icon: Calendar },
  { label: 'Team', href: '/team', icon: Users2 },
  { label: 'Achievements', href: '/achievements', icon: Trophy },
] as const

export const ClubNav: React.FC<ClubNavProps> = ({
  slug,
  hasEvents = true,
  hasTeam = true,
  hasAchievements = true,
}) => {
  const pathname = usePathname()
  const basePath = `/clubs/${slug}`

  // Determine which tab is active
  const getIsActive = (tabHref: string) => {
    const fullPath = basePath + tabHref
    if (tabHref === '') {
      // Overview is active when we're at the exact club page
      return pathname === basePath || pathname === basePath + '/'
    }
    return pathname.startsWith(fullPath)
  }

  const visibleTabs = tabs.filter((tab) => {
    if (tab.href === '/events' && !hasEvents) return false
    if (tab.href === '/team' && !hasTeam) return false
    if (tab.href === '/achievements' && !hasAchievements) return false
    return true
  })

  return (
    <nav className="border-b border-border" aria-label="Club sections">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar -mb-px">
          {visibleTabs.map((tab) => {
            const isActive = getIsActive(tab.href)
            const Icon = tab.icon
            return (
              <Link
                key={tab.href}
                href={basePath + tab.href}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                  isActive
                    ? 'border-accent text-accent'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border',
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
