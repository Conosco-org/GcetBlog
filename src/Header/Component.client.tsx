'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState, Suspense } from 'react'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'

import type { Header } from '@/payload-types'

import { AuthButton } from '@/components/Header/AuthButton'
import { GlobalSearchBar } from '@/components/GlobalSearchBar'

interface HeaderClientProps {
  data: Header
  categories?: Array<{ id: string; title: string; slug: string }>
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data: _data, categories = [] }) => {
  const [theme, setTheme] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()

  useEffect(() => {
    setHeaderTheme(null)
  }, [pathname, setHeaderTheme])

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
  }, [headerTheme, theme])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          scrolled
            ? 'bg-background/95 backdrop-blur-md border-b border-border shadow-sm'
            : 'bg-background/80 backdrop-blur-sm border-b border-transparent'
        }`}
        {...(theme ? { 'data-theme': theme } : {})}
      >
        <div className="container mx-auto flex h-16 items-center px-6 gap-4">
          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 -ml-2 hover:bg-card rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 group">
              <Image
                src="https://res.cloudinary.com/dqpvhbkdd/image/upload/v1761577830/Gcet_Logo_i9fkbt.png"
                alt="GCET Logo"
                width={36}
                height={36}
                className="object-contain"
              />
              <span className="font-display text-xl font-bold tracking-tight text-accent group-hover:opacity-80 transition-opacity">
                GCET <span className="text-foreground">Blog</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="ml-auto flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-8">
              <Link
                href="/posts"
                className={`text-sm font-medium tracking-wide transition-colors hover:text-accent ${
                  pathname === '/posts' || pathname?.startsWith('/posts/page') ? 'text-accent' : 'text-muted-foreground'
                }`}
              >
                Posts
              </Link>
              <Link
                href="/contact"
                className={`text-sm font-medium tracking-wide transition-colors hover:text-accent ${
                  pathname === '/contact' ? 'text-accent' : 'text-muted-foreground'
                }`}
              >
                Contact
              </Link>
            </nav>

            <Suspense fallback={null}>
              <GlobalSearchBar categories={categories} variant="header" />
            </Suspense>

            <div className="w-px h-5 bg-border hidden md:block" />

            <AuthButton />
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-50 bg-background/98 backdrop-blur-md animate-fade-in">
          <nav className="container flex flex-col gap-1 p-6">
            <Link
              href="/posts"
              className="text-lg font-medium py-4 px-4 rounded-xl hover:bg-card transition-colors border-b border-border"
              onClick={() => setMobileMenuOpen(false)}
            >
              Posts
            </Link>
            <Link
              href="/contact"
              className="text-lg font-medium py-4 px-4 rounded-xl hover:bg-card transition-colors border-b border-border"
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