'use client'

import { useState } from 'react'
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
  X
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
}

export function EditorSidebar({ 
  user, 
  pendingPostsCount = 0,
  totalPostsCount = 0,
  activityLogsCount = 0
}: EditorSidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(true) // Start open by default

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
      {/* Hamburger Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar - Static positioning to push content */}
      {isOpen && (
        <aside className="w-64 border-r bg-background flex flex-col h-screen sticky top-0">
          {/* Logo & User Info */}
          <div className="p-6 border-b mt-16">
            <Link href="/editor" className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                GC
              </div>
              <span className="text-xl font-bold">GCET Blog</span>
            </Link>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                {(user.name || user.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">
                  {user.name || 'Content Editor'}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Badge variant="secondary" className="text-xs uppercase">
                    {user.role}
                  </Badge>
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
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
