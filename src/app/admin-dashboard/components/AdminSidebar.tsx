'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { LogoutButton } from '@/components/LogoutButton'
import {
  BarChart3,
  Users,
  Activity,
  ExternalLink,
  Globe,
  Edit3,
  UserCircle,
} from 'lucide-react'
import { cn } from '@/utilities/ui'

interface AdminSidebarProps {
  stats: {
    totalUsers: number
    totalPosts: number
    pendingReviews: number
    totalComments: number
    contributors: number
    editors: number
  }
  isOpen: boolean
}

export function AdminSidebar({ stats, isOpen }: AdminSidebarProps) {
  const pathname = usePathname()

  const navigation = [
    { name: 'Dashboard', href: '/admin-dashboard', icon: BarChart3 },
    { name: 'User Management', href: '/admin-dashboard/users', icon: Users, badge: stats.totalUsers },
    { name: 'Activity Logs', href: '/admin-dashboard/logs', icon: Activity },
    { name: 'Profile', href: '/admin-dashboard/profile', icon: UserCircle },
  ]

  const externalLinks = [
    { name: 'Editor View', href: '/editor', icon: Edit3 },
    { name: 'Public Blog', href: '/', icon: Globe },
  ]

  return (
    <aside className={cn(
      "fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 border-r bg-card transition-transform duration-300 z-30 overflow-hidden",
      !isOpen && "-translate-x-full"
    )}>
      <div className="flex h-full flex-col overflow-y-auto">
        {/* User Role Breakdown */}
        <div className="p-3 border-b flex-shrink-0">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
            Platform Overview
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center p-2 rounded-md bg-muted/50">
              <p className="text-lg font-bold">{stats.editors}</p>
              <p className="text-[10px] text-muted-foreground">Editors</p>
            </div>
            <div className="text-center p-2 rounded-md bg-muted/50">
              <p className="text-lg font-bold">{stats.contributors}</p>
              <p className="text-[10px] text-muted-foreground">Writers</p>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 min-h-0 overflow-y-auto p-3" aria-label="Admin navigation">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <Badge
                      variant={isActive ? 'secondary' : 'outline'}
                      className="h-5 min-w-5 px-1.5 text-xs"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              )
            })}
          </div>

          {/* External Links */}
          <div className="mt-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-3">
              Quick Access
            </p>
            <div className="space-y-1">
              {externalLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </div>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {/* Logout */}
        <div className="border-t p-3 flex-shrink-0">
          <LogoutButton className="w-full justify-start gap-2" />
        </div>
      </div>
    </aside>
  )
}
