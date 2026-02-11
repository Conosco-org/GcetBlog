'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User } from '@/payload-types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LogoutButton } from '@/components/LogoutButton'
import {
  BarChart3,
  Users,
  Shield,
  FileText,
  ClipboardList,
  MessageSquare,
  Activity,
  Settings,
  ExternalLink,
  Globe,
  Edit3,
} from 'lucide-react'
import { cn } from '@/utilities/ui'

interface AdminSidebarProps {
  user: User
  stats: {
    totalUsers: number
    totalPosts: number
    pendingRequests: number
    pendingReviews: number
    totalComments: number
    contributors: number
    editors: number
    admins: number
  }
  isOpen: boolean
}

export function AdminSidebar({ user, stats, isOpen }: AdminSidebarProps) {
  const pathname = usePathname()

  const navigation = [
    { name: 'Dashboard', href: '/admin-dashboard', icon: BarChart3 },
    { name: 'User Management', href: '/admin-dashboard/users', icon: Users, badge: stats.totalUsers },
    { name: 'Role Requests', href: '/admin-dashboard/requests', icon: Shield, badge: stats.pendingRequests },
    { name: 'All Posts', href: '/admin-dashboard/posts', icon: FileText, badge: stats.totalPosts },
    { name: 'Review Queue', href: '/editor/queue', icon: ClipboardList, badge: stats.pendingReviews },
    { name: 'Comments', href: '/editor/comments', icon: MessageSquare, badge: stats.totalComments },
    { name: 'Activity Logs', href: '/admin-dashboard/logs', icon: Activity },
  ]

  const externalLinks = [
    { name: 'Payload CMS', href: '/admin', icon: Shield },
    { name: 'Editor View', href: '/editor', icon: Edit3 },
    { name: 'Public Blog', href: '/', icon: Globe },
  ]

  return (
    <aside className={cn(
      "fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 border-r bg-card transition-transform duration-300 z-30",
      !isOpen && "-translate-x-full"
    )}>
      <div className="flex h-full flex-col">
        {/* User Role Breakdown */}
        <div className="p-4 border-b">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Platform Overview
          </p>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 rounded-md bg-muted/50">
              <p className="text-lg font-bold">{stats.admins}</p>
              <p className="text-[10px] text-muted-foreground">Admins</p>
            </div>
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
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
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

        {/* Quick Actions */}
        <div className="border-t p-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Admin Actions
            </p>
            <Button className="w-full justify-start gap-2" size="sm" asChild>
              <Link href="/admin">
                <Shield className="h-4 w-4" />
                Open Payload CMS
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" size="sm" asChild>
              <Link href="/admin-dashboard/requests">
                <ClipboardList className="h-4 w-4" />
                Review Requests
              </Link>
            </Button>
          </div>
        </div>

        {/* Logout */}
        <div className="border-t p-4">
          <LogoutButton className="w-full justify-start gap-2" />
          <p className="mt-3 text-xs text-muted-foreground text-center">
            v2.4.1 - Admin
          </p>
        </div>
      </div>
    </aside>
  )
}
