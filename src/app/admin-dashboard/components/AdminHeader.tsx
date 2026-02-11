'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Menu, X, Moon, Sun, LogOut, User as UserIcon, Eye, Edit3 } from 'lucide-react'
import type { User } from '@/payload-types'
import { useTheme } from '@/providers/Theme'

interface AdminHeaderProps {
  user: User & { role: string }
  isOpen: boolean
  onToggle: () => void
}

export function AdminHeader({ user, isOpen, onToggle }: AdminHeaderProps) {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
      router.refresh()
    } catch {
      router.push('/login')
      router.refresh()
    }
  }

  const initials = (user.name || user.email || 'A')
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b bg-background backdrop-blur supports-[backdrop-filter]:bg-background/95">
      <div className="flex h-16 items-center px-4 gap-4">
        {/* Hamburger Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={onToggle}
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        {/* Left side - GCET Blog Logo */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="https://res.cloudinary.com/dqpvhbkdd/image/upload/v1761577830/Gcet_Logo_i9fkbt.png"
              alt="GCET Logo"
              width={40}
              height={40}
              className="object-contain"
            />
            <span className="text-xl font-bold">GCET Blog</span>
          </Link>
        </div>

        {/* Right side - Theme Toggle & User Menu */}
        <div className="ml-auto flex items-center gap-3">
          {/* Theme Toggle Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="relative"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full" aria-label="User menu">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user.name || 'Admin'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                  <Badge variant="secondary" className="w-fit mt-1 text-xs capitalize">
                    {user.role}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/admin-dashboard/profile" className="cursor-pointer">
                  <UserIcon className="mr-2 h-4 w-4" />
                  Profile & Account
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/editor" className="cursor-pointer">
                  <Edit3 className="mr-2 h-4 w-4" />
                  Editor View
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/" className="cursor-pointer">
                  <Eye className="mr-2 h-4 w-4" />
                  Public Blog
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-destructive focus:text-destructive"
                disabled={loggingOut}
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                {loggingOut ? 'Logging out...' : 'Logout'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
