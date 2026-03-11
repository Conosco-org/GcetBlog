'use client'

import React from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import Link from 'next/link'
import { SearchIcon, FileText, Settings } from 'lucide-react'
import { useUser } from '@/providers/User'

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = data?.navItems || []
  const { user } = useUser()

  return (
    <nav className="flex gap-3 items-center">
      {navItems.map(({ link }, i) => {
        return <CMSLink key={i} {...link} appearance="link" />
      })}
      
      {/* Role-based navigation items */}
      {user && (user.roleAssignments?.length ?? 0) > 0 && (
        <Link 
          href="/user" 
          className="flex items-center gap-1 text-sm hover:text-primary transition-colors"
          title="Dashboard"
        >
          <FileText className="w-4 h-4" />
          <span className="hidden sm:inline">Dashboard</span>
        </Link>
      )}
      
      {user && user.role === 'superadmin' && (
        <Link 
          href="/platform"
          className="flex items-center gap-1 text-sm hover:text-primary transition-colors"
          title="Platform Admin"
        >
          <Settings className="w-4 h-4" />
          <span className="hidden sm:inline">Platform</span>
        </Link>
      )}
      
      <Link href="/search">
        <span className="sr-only">Search</span>
        <SearchIcon className="w-5 text-primary" />
      </Link>
    </nav>
  )
}
