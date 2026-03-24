'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useDebounce } from '@/utilities/useDebounce'

interface GlobalSearchBarProps {
  categories?: Array<{ id: string; title: string; slug: string }>
  className?: string
  variant?: 'header' | 'page'
}

export function GlobalSearchBar({ categories = [], className, variant = 'header' }: GlobalSearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '')
  const [selectedTag, setSelectedTag] = useState(searchParams.get('tag') || '')
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'latest')
  const [isOpen, setIsOpen] = useState(variant === 'page')
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const debouncedQuery = useDebounce(query, 300)

  // Build URL with params and navigate
  const navigateToSearch = useCallback((params: Record<string, string>) => {
    const url = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.set(key, value)
    })
    router.push(`/posts?${url.toString()}`)
  }, [router])

  // Navigate when debounced query or filters change
  useEffect(() => {
    if (variant === 'page') {
      const params: Record<string, string> = {}
      if (debouncedQuery) params.q = debouncedQuery
      if (selectedCategory) params.category = selectedCategory
      if (selectedTag) params.tag = selectedTag
      if (sortBy && sortBy !== 'latest') params.sort = sortBy
      navigateToSearch(params)
    }
  }, [debouncedQuery, selectedCategory, selectedTag, sortBy, variant, navigateToSearch])

  // Handle keyboard shortcut (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (variant === 'header') {
          setIsOpen(true)
          setTimeout(() => inputRef.current?.focus(), 100)
        } else {
          inputRef.current?.focus()
        }
      }
      if (e.key === 'Escape') {
        if (variant === 'header') {
          setIsOpen(false)
        }
        inputRef.current?.blur()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [variant])

  // Close on click outside for header variant
  useEffect(() => {
    if (variant !== 'header' || !isOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, variant])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params: Record<string, string> = {}
    if (query) params.q = query
    if (selectedCategory) params.category = selectedCategory
    if (selectedTag) params.tag = selectedTag
    if (sortBy && sortBy !== 'latest') params.sort = sortBy

    if (variant === 'header') {
      // Close modal first, then navigate with a small delay to ensure
      // the router.push takes effect even when the component re-renders
      setIsOpen(false)
      const url = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value) url.set(key, value)
      })
      // Use window.location for reliable cross-page navigation from home
      window.location.href = `/posts?${url.toString()}`
    } else {
      navigateToSearch(params)
    }
  }

  const clearSearch = () => {
    setQuery('')
    setSelectedCategory('')
    setSelectedTag('')
    setSortBy('latest')
    if (variant === 'page') {
      router.push('/posts')
    }
  }

  // Header variant: compact search icon that expands
  if (variant === 'header') {
    if (!isOpen) {
      return (
        <button
          onClick={() => {
            setIsOpen(true)
            setTimeout(() => inputRef.current?.focus(), 100)
          }}
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl border border-border/60 bg-card hover:bg-muted/80 transition-all duration-150 text-muted-foreground text-sm shadow-sm hover:shadow"
          aria-label="Search posts (Ctrl+K)"
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Search...</span>
        </button>
      )
    }

    return (
      <div ref={containerRef} className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] bg-black/60 animate-in fade-in duration-150">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-xl mx-4 bg-background rounded-2xl border border-border/60 shadow-[0_25px_60px_-12px_rgba(0,0,0,0.35)] overflow-hidden animate-in slide-in-from-top-4 fade-in duration-200"
        >
          {/* Search input */}
          <div className="flex items-center gap-3 px-5 py-4">
            <Search className="h-5 w-5 text-muted-foreground/70 shrink-0" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search posts, tags, categories..."
              className="border-0 bg-transparent text-base font-medium placeholder:font-normal focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto"
              autoFocus
            />
            {query && (
              <button type="button" onClick={clearSearch} className="shrink-0 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <X className="h-4 w-4" />
              </button>
            )}
            <button type="button" onClick={() => setIsOpen(false)} className="shrink-0 ml-1">
              <kbd className="inline-flex h-6 items-center rounded-md border border-border bg-muted/60 px-2 text-[11px] font-medium text-muted-foreground select-none">
                ESC
              </kbd>
            </button>
          </div>

          {/* Divider */}
          <div className="mx-5 h-px bg-border/60" />

          {/* Quick filters */}
          {categories.length > 0 && (
            <div className="px-5 py-4">
              <p className="text-[11px] font-semibold text-muted-foreground/70 mb-3 uppercase tracking-widest">Categories</p>
              <div className="flex flex-wrap gap-2">
                {categories.slice(0, 8).map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat.slug === selectedCategory ? '' : cat.slug)
                    }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-150 ${
                      selectedCategory === cat.slug
                        ? 'bg-accent text-accent-foreground border-accent shadow-sm'
                        : 'border-border/60 text-muted-foreground hover:bg-muted hover:text-foreground hover:border-border'
                    }`}
                  >
                    {cat.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="px-5 py-3 bg-muted/30 border-t border-border/60 flex justify-between items-center">
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground/70">
              <span className="inline-flex items-center gap-1.5">
                <kbd className="inline-flex h-5 items-center rounded border border-border bg-background px-1.5 text-[10px] font-medium">↵</kbd>
                Search
              </span>
              <span className="inline-flex items-center gap-1.5">
                <kbd className="inline-flex h-5 items-center rounded border border-border bg-background px-1.5 text-[10px] font-medium">ESC</kbd>
                Close
              </span>
            </div>
            <Button type="submit" variant="ghost" size="sm" className="text-xs font-medium text-muted-foreground hover:text-foreground -mr-2">
              Go to results →
            </Button>
          </div>
        </form>
      </div>
    )
  }

  // Page variant: inline search with full filters
  return (
    <div className={`w-full ${className || ''}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search posts by title, content, tags..."
            className="pl-10 pr-20 h-12 text-base"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {query && (
              <Button type="button" variant="ghost" size="sm" onClick={clearSearch} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={`h-8 w-8 p-0 ${showFilters ? 'text-accent' : ''}`}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="flex flex-wrap gap-4 p-4 bg-card rounded-lg border border-border animate-fade-up">
            {/* Category filter */}
            {categories.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Category
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('')}
                    className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                      !selectedCategory
                        ? 'bg-accent text-accent-foreground border-accent'
                        : 'border-border hover:bg-muted'
                    }`}
                  >
                    All
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.slug === selectedCategory ? '' : cat.slug)}
                      className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                        selectedCategory === cat.slug
                          ? 'bg-accent text-accent-foreground border-accent'
                          : 'border-border hover:bg-muted'
                      }`}
                    >
                      {cat.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sort */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Sort By
              </label>
              <div className="flex gap-1.5">
                {[
                  { label: 'Latest', value: 'latest' },
                  { label: 'Most Voted', value: 'votes' },
                  { label: 'Oldest', value: 'oldest' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSortBy(opt.value)}
                    className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                      sortBy === opt.value
                        ? 'bg-accent text-accent-foreground border-accent'
                        : 'border-border hover:bg-muted'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tag filter */}
            <div className="space-y-2 flex-1 min-w-[200px]">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Tag
              </label>
              <Input
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                placeholder="Filter by tag..."
                className="h-8 text-xs"
              />
            </div>
          </div>
        )}
      </form>

      {/* Active filters */}
      {(selectedCategory || selectedTag || (sortBy && sortBy !== 'latest')) && (
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span className="text-xs text-muted-foreground">Active filters:</span>
          {selectedCategory && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-accent/10 text-accent rounded-full">
              Category: {categories.find(c => c.slug === selectedCategory)?.title || selectedCategory}
              <button onClick={() => setSelectedCategory('')} className="hover:text-foreground" aria-label="Clear category filter">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {selectedTag && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-accent/10 text-accent rounded-full">
              Tag: {selectedTag}
              <button onClick={() => setSelectedTag('')} className="hover:text-foreground" aria-label="Clear tag filter">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {sortBy && sortBy !== 'latest' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-accent/10 text-accent rounded-full">
              Sort: {sortBy}
              <button onClick={() => setSortBy('latest')} className="hover:text-foreground" aria-label="Clear sort filter">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          <button
            onClick={clearSearch}
            className="text-xs text-muted-foreground hover:text-foreground underline"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  )
}
