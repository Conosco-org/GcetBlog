'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/utilities/ui'
import { 
  LayoutDashboard, 
  FileText, 
  Image, 
  FolderOpen, 
  Users, 
  MessageSquare,
  Settings,
  BarChart3,
  Shield
} from 'lucide-react'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/collections/posts', label: 'Posts', icon: FileText },
  { href: '/admin/collections/pages', label: 'Pages', icon: FolderOpen },
  { href: '/admin/collections/media', label: 'Media', icon: Image },
  { href: '/admin/collections/categories', label: 'Categories', icon: FolderOpen },
  { href: '/admin/collections/comments', label: 'Comments', icon: MessageSquare },
  { href: '/admin/collections/users', label: 'Users', icon: Users },
  { href: '/admin/collections/role-upgrade-requests', label: 'Role Requests', icon: Shield },
  { href: '/admin/collections/admin-logs', label: 'Activity Logs', icon: BarChart3 },
]

export default function CustomNav() {
  const pathname = usePathname()

  return (
    <nav className="flex-1 overflow-y-auto py-4">
      <div className="px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 shadow-sm'
                  : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800/50'
              )}
            >
              <Icon className={cn('w-4 h-4', isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400')} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>

      {/* Globals Section */}
      <div className="mt-6 px-3">
        <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
          Global Settings
        </h3>
        <div className="space-y-1">
          <Link
            href="/admin/globals/header"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800/50 transition-all"
          >
            <Settings className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span>Header</span>
          </Link>
          <Link
            href="/admin/globals/footer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800/50 transition-all"
          >
            <Settings className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span>Footer</span>
          </Link>
        </div>
      </div>
    </nav>
  )
}
