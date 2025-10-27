'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'

import type { Header } from '@/payload-types'

import { Button } from '@/components/ui/button'
import { AuthButton } from '@/components/Header/AuthButton'

interface HeaderClientProps {
  data: Header
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data: _data }) => {
  /* Storing the value in a useState to avoid hydration errors */
  const [theme, setTheme] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()

  useEffect(() => {
    setHeaderTheme(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" {...(theme ? { 'data-theme': theme } : {})}>
        <div className="container flex h-16 items-center px-4 gap-4">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
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

          {/* Right side - Desktop Navigation Links */}
          <div className="ml-auto flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-6">
              <Link 
                href="/posts" 
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Posts
              </Link>
              <Link 
                href="/contact" 
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Contact
              </Link>
            </nav>
            
            <AuthButton />
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90">
          <nav className="container flex flex-col gap-4 p-6">
            <Link 
              href="/posts" 
              className="text-lg font-medium transition-colors hover:text-primary py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Posts
            </Link>
            <Link 
              href="/contact" 
              className="text-lg font-medium transition-colors hover:text-primary py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
          </nav>
        </div>
      )}
    </>
  )
}
