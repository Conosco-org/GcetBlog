'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogoutButton } from '@/components/LogoutButton'
import type { User } from '@/payload-types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Home, 
  FileText, 
  Clock, 
  Image, 
  FileStack, 
  BarChart3, 
  Activity, 
  Settings, 
  Eye,
  Menu,
  X,
  Tag
} from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  badge?: number
}

interface EditorSidebarProps {
  user: User & { role: string }
  pendingPostsCount?: number
  totalPostsCount?: number
  activityLogsCount?: number
  isOpen: boolean
  onToggle: () => void
}

export function EditorSidebar({ 
  user, 
  pendingPostsCount = 0,
  totalPostsCount = 0,
  activityLogsCount = 0,
  isOpen,
  onToggle
}: EditorSidebarProps) {
  const pathname = usePathname()

  const navItems: NavItem[] = [
    {
      label: 'Dashboard',
      href: '/editor',
      icon: <Home className="w-5 h-5" />,
    },
    {
      label: 'Content Manager',
      href: '/editor/content',
      icon: <FileText className="w-5 h-5" />,
      badge: totalPostsCount,
    },
    {
      label: 'Review Queue',
      href: '/editor/queue',
      icon: <Clock className="w-5 h-5" />,
      badge: pendingPostsCount,
    },
    {
      label: 'Media Manager',
      href: '/editor/media',
      icon: <Image className="w-5 h-5" />,
    },
    {
      label: 'Categories',
      href: '/editor/categories',
      icon: <Tag className="w-5 h-5" />,
    },
    {
      label: 'Templates',
      href: '/editor/templates',
      icon: <FileStack className="w-5 h-5" />,
    },
    {
      label: 'Analytics',
      href: '/editor/analytics',
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      label: 'Activity Logs',
      href: '/editor/activity',
      icon: <Activity className="w-5 h-5" />,
      badge: activityLogsCount,
    },
    {
      label: 'Workspace Settings',
      href: '/editor/settings',
      icon: <Settings className="w-5 h-5" />,
    },
    {
      label: 'Public Blog View',
      href: '/',
      icon: <Eye className="w-5 h-5" />,
    },
  ]

  const isActive = (href: string) => {
    if (href === '/editor') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Sidebar - Fixed positioning */}
      {isOpen && (
        <aside className="w-64 border-r bg-background flex flex-col fixed left-0 top-16 bottom-0 z-30">
          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const active = isActive(item.href)
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                        ${active 
                          ? 'bg-primary/10 text-primary' 
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        }
                      `}
                    >
                      <span>
                        {item.icon}
                      </span>
                      <span className="flex-1">{item.label}</span>
                      {item.badge !== undefined && (
                        <Badge variant={active ? "default" : "secondary"} className="ml-auto">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t">
            <LogoutButton className="w-full" />
            <p className="text-xs text-muted-foreground text-center mt-3">v2.4.1</p>
          </div>
        </aside>
      )}
    </>
  )
}
