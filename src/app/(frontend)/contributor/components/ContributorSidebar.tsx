'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useTransition, useCallback, useEffect } from 'react'
import { User } from '@/payload-types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LogoutButton } from '@/components/shared/LogoutButton'
import { 
  BarChart3, 
  FileText, 
  PlusCircle, 
  Send, 
  MessageSquare, 
  Globe, 
  Edit3,
  UserCircle,
  Loader2,
  FileStack,
} from 'lucide-react'
import { cn } from '@/utilities/ui'

interface ContributorSidebarProps {
  user: User
  stats: {
    drafts: number
    submissions: number
    published: number
    feedback: number
  }
  isOpen: boolean
}

export function ContributorSidebar({ stats, isOpen }: ContributorSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null)

  const navigation = [
    { name: 'Dashboard', href: '/contributor', icon: BarChart3 },
    { name: 'Add Content', href: '/contributor/create', icon: PlusCircle },
    { name: 'Templates', href: '/contributor/templates', icon: FileStack },
    { name: 'My Drafts', href: '/contributor/drafts', icon: FileText, badge: stats.drafts },
    { name: 'Submissions', href: '/contributor/submissions', icon: Send, badge: stats.submissions },
    { name: 'Feedback Center', href: '/contributor/feedback', icon: MessageSquare, badge: stats.feedback },
    { name: 'Profile', href: '/contributor/profile', icon: UserCircle },
    { name: 'Public Blog', href: '/', icon: Globe },
  ]

  const handleNavClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // Don't intercept external links (Public Blog)
    if (href === '/') return
    // Don't intercept if already on that page
    if (pathname === href) {
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
    <aside className={cn(
      "fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 border-r bg-card transition-transform duration-300 z-30",
      !isOpen && "-translate-x-full"
    )}>
      <div className="flex h-full flex-col">
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4" aria-label="Contributor navigation">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              const isLoading = isPending && navigatingTo === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  aria-current={isActive ? 'page' : undefined}
                  aria-busy={isLoading}
                  className={cn(
                    'flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : isLoading
                        ? 'bg-muted/70 text-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <div className="flex items-center gap-3">
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <item.icon className="h-4 w-4" />
                    )}
                    <span>{item.name}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <Badge 
                      variant={isActive ? "secondary" : "outline"}
                      className="h-5 min-w-5 px-1.5 text-xs"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Quick Actions */}
        <div className="border-t p-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Quick Actions
            </p>
            <Button className="w-full justify-start gap-2" size="sm" asChild>
              <Link href="/contributor/create">
                <PlusCircle className="h-4 w-4" />
                New Article
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" size="sm" asChild>
              <Link href="/contributor/drafts">
                <Edit3 className="h-4 w-4" />
                Continue Draft
              </Link>
            </Button>
          </div>
        </div>

        {/* Logout */}
        <div className="border-t p-4">
          <LogoutButton className="w-full justify-start gap-2" />
          <p className="mt-3 text-xs text-muted-foreground text-center">
            Contributor Panel
          </p>
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
      </div>
    </aside>
  )
}
