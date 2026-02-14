'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTransition, useCallback, useState, useEffect } from 'react'
import { LogoutButton } from '@/components/LogoutButton'
import type { User } from '@/payload-types'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import { 
  Home, 
  FileText, 
  Clock, 
  Image, 
  FileStack, 
  BarChart3, 
  Activity, 
  Tag,
  Users,
  Mail,
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
  _onToggle?: () => void
}

export function EditorSidebar({ 
  user: _user, 
  pendingPostsCount = 0,
  totalPostsCount = 0,
  activityLogsCount = 0,
  isOpen,
  _onToggle
}: EditorSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null)
  const isAdmin = (_user as unknown as { isAdmin?: boolean }).isAdmin === true

  const navItems: NavItem[] = [
    // For admins: show Admin Dashboard, for others: show Editor Dashboard
    {
      label: isAdmin ? 'Admin Dashboard' : 'Dashboard',
      href: isAdmin ? '/admin-dashboard' : '/editor',
      icon: <Home className="w-5 h-5" />,
    },
    // Admin-only link: User Management - moved to top for priority
    ...(isAdmin ? [
      {
        label: 'User Management',
        href: '/admin-dashboard/users',
        icon: <Users className="w-5 h-5" />,
      },
    ] : []),
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
      label: 'Newsletter',
      href: '/editor/newsletter',
      icon: <Mail className="w-5 h-5" />,
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
  ]

  const isActive = (href: string) => {
    // Dashboard routes: exact match only
    if (href === '/editor' || href === '/admin-dashboard') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  const handleNavClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // Don't intercept external links
    if (href === '/') return
    // Don't intercept if already on that page
    if (isActive(href)) {
      e.preventDefault()
      return
    }
    e.preventDefault()
    setNavigatingTo(href)
    startTransition(() => {
      router.push(href)
    })
  }, [pathname, router, startTransition])

  // Clear navigating state when pathname changes
  useEffect(() => {
    setNavigatingTo(null)
  }, [pathname])

  return (
    <>
      {/* Sidebar - Fixed positioning */}
      {isOpen && (
        <aside className="w-64 border-r bg-background flex flex-col fixed left-0 top-16 bottom-0 z-30">
          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const active = isActive(item.href)
                const isLoading = isPending && navigatingTo === item.href
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={(e) => handleNavClick(e, item.href)}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                        ${active 
                          ? 'bg-primary/10 text-primary' 
                          : isLoading
                            ? 'bg-accent/50 text-accent-foreground'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        }
                      `}
                      aria-busy={isLoading}
                    >
                      <span className="relative">
                        {isLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          item.icon
                        )}
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
            <p className="text-[11px] text-muted-foreground text-center mt-1">
              Powered by{' '}
              <a
                href="https://conosco.in"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                Conosco
              </a>
            </p>
          </div>
        </aside>
      )}
    </>
  )
}
