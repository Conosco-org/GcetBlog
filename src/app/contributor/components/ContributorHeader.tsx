'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Menu, X, Moon, Sun } from 'lucide-react'
import type { User } from '@/payload-types'
import { useTheme } from '@/providers/Theme'

interface ContributorHeaderProps {
  user: User & { role: string }
  isOpen: boolean
  onToggle: () => void
}

export function ContributorHeader({ user, isOpen, onToggle }: ContributorHeaderProps) {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

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

        {/* Right side - Theme Toggle & User Info */}
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

          {/* User Info */}
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg border bg-card">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-sm">
              {(user.name || user.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <p className="font-medium text-sm truncate">
                {user.name || 'Contributor'}
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs h-5">
                  {user.role}
                </Badge>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  Online
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
