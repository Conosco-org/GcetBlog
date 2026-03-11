'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogoutButton } from '@/components/LogoutButton'
import {
  LayoutDashboard,
  Building2,
  Users,
  ShieldCheck,
} from 'lucide-react'
import { cn } from '@/utilities/ui'

interface PlatformSidebarProps {
  user: { name?: string; email?: string; role?: string }
}

const navItems = [
  { label: 'Dashboard', href: '/platform', icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: 'Institutions', href: '/platform/institutions', icon: <Building2 className="h-4 w-4" /> },
  { label: 'All Users', href: '/platform/users', icon: <Users className="h-4 w-4" /> },
]

export function PlatformSidebar({ user }: PlatformSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="w-64 shrink-0 flex flex-col bg-sidebar border-r border-border min-h-screen">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-white">
          <ShieldCheck className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground leading-tight">Platform Admin</p>
          <p className="text-xs text-muted-foreground">Superadmin Console</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = item.href === '/platform'
            ? pathname === '/platform'
            : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          )
        })}

      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-border space-y-2">
        <div className="flex items-center gap-2 px-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
            {(user?.name || user?.email || 'S').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{user?.name || user?.email}</p>
            <p className="text-xs text-amber-600 font-medium">SuperAdmin</p>
          </div>
        </div>
        <LogoutButton className="w-full text-xs h-8" />
      </div>
    </aside>
  )
}
