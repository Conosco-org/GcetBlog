'use client'

import React from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import Link from 'next/link'
import { SearchIcon, Users, FileText, Settings } from 'lucide-react'
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
      {user && user.role === 'editor' && (
        <Link 
          href="/editor" 
          className="flex items-center gap-1 text-sm hover:text-primary transition-colors"
          title="Editor Dashboard"
        >
          <FileText className="w-4 h-4" />
          <span className="hidden sm:inline">Editor</span>
        </Link>
      )}
      
      {user && user.role === 'admin' && (
        <>
          <Link 
            href="/editor" 
            className="flex items-center gap-1 text-sm hover:text-primary transition-colors"
            title="Editor Dashboard"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Editor</span>
          </Link>
          <Link 
            href="/admin" 
            className="flex items-center gap-1 text-sm hover:text-primary transition-colors"
            title="Admin Panel"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Admin</span>
          </Link>
          <Link 
            href="/dashboard/admin" 
            className="flex items-center gap-1 text-sm hover:text-primary transition-colors"
            title="User Management"
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Users</span>
          </Link>
        </>
      )}
      
      <Link href="/search">
        <span className="sr-only">Search</span>
        <SearchIcon className="w-5 text-primary" />
      </Link>
    </nav>
  )
}
