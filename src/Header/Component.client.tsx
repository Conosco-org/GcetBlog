'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import React, { useEffect, useState, useRef, Suspense } from 'react'
import Image from 'next/image'
import { Menu, X, Search, BookOpen, Users, Calendar } from 'lucide-react'

import type { Header } from '@/payload-types'

import { AuthButton } from '@/components/Header/AuthButton'
import { GlobalSearchBar } from '@/components/GlobalSearchBar'
import type { ScopedNavItem } from '@/utilities/domainScope'

/** Map icon name strings to Lucide components */
const NAV_ICONS: Record<string, React.FC<{ className?: string }>> = {
  'book-open': BookOpen,
  users: Users,
  calendar: Calendar,
}

interface HeaderClientProps {
  data: Header
  categories?: Array<{ id: string; title: string; slug: string }>
  scopedNavItems?: ScopedNavItem[]
  domainPurpose?: string
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data: _data, categories = [], scopedNavItems = [], domainPurpose: _domainPurpose }) => {
  const [theme, setTheme] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mobileQuery, setMobileQuery] = useState('')
  const mobileInputRef = useRef<HTMLInputElement>(null)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    setHeaderTheme(null)
  }, [pathname, setHeaderTheme])

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
  }, [headerTheme, theme])

  useEffect(() => {
    setMobileMenuOpen(false)
    setMobileQuery('')
  }, [pathname])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileMenuOpen])

  const handleMobileSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!mobileQuery.trim()) return
    setMobileMenuOpen(false)
    router.push(`/posts?q=${encodeURIComponent(mobileQuery.trim())}`)
    setMobileQuery('')
  }

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
        <div className="container mx-auto flex h-16 items-center px-4 sm:px-6 gap-2 sm:gap-4">
          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 -ml-2 hover:bg-card rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
              <Image
                src="https://res.cloudinary.com/dqpvhbkdd/image/upload/v1761577830/Gcet_Logo_i9fkbt.png"
                alt="GCET Logo"
                width={36}
                height={36}
                className="object-contain w-8 h-8 sm:w-9 sm:h-9"
              />
              <span className="font-display text-lg sm:text-xl font-bold tracking-tight text-accent group-hover:opacity-80 transition-opacity">
                GCET <span className="text-foreground">Blog</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="ml-auto flex items-center gap-4 sm:gap-6">
            <nav className="hidden md:flex items-center gap-8">
              {scopedNavItems.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-sm font-medium tracking-wide transition-colors hover:text-accent ${
                      isActive ? 'text-accent' : 'text-muted-foreground'
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            <Suspense fallback={null}>
              <div className="hidden md:block">
                <GlobalSearchBar categories={categories} variant="header" />
              </div>
            </Suspense>

            <div className="w-px h-5 bg-border hidden md:block" />

            <AuthButton />
          </div>
        </div>
      </header>

      {/* Mobile Menu - slide-down panel */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-50 bg-background overflow-y-auto">
          <div className="p-4 space-y-3">
            {/* Mobile Search - inline, no overlay */}
            <form onSubmit={handleMobileSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                ref={mobileInputRef}
                type="text"
                value={mobileQuery}
                onChange={(e) => setMobileQuery(e.target.value)}
                placeholder="Search posts..."
                className="w-full h-11 pl-10 pr-4 rounded-lg border border-border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
                autoFocus
              />
              {mobileQuery && (
                <button
                  type="button"
                  onClick={() => setMobileQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </form>

            {/* Navigation Links */}
            <nav className="space-y-1" aria-label="Mobile navigation">
              {scopedNavItems.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                const IconComponent = item.icon ? NAV_ICONS[item.icon] : null
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-accent/10 text-accent'
                        : 'text-foreground hover:bg-card'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {IconComponent && <IconComponent className="h-4 w-4" />}
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            {/* Category Quick Links */}
            {categories.length > 0 && (
              <div className="pt-3 border-t border-border">
                <p className="px-4 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Categories
                </p>
                <div className="flex flex-wrap gap-2 px-4">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/posts?category=${cat.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-1.5 text-xs font-medium rounded-full border border-border bg-card hover:bg-accent hover:text-accent-foreground hover:border-accent transition-colors"
                    >
                      {cat.title}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}