'use client'

import React, { useCallback, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@frontend/lib/utils'
import { X } from 'lucide-react'

interface PostsFilterBarProps {
  categories: Array<{ id: string; title: string; slug: string }>
}

export function PostsFilterBar({ categories }: PostsFilterBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const currentCategory = searchParams.get('category') || ''
  const currentSort = searchParams.get('sort') || 'latest'
  const currentQuery = searchParams.get('q') || ''

  const navigate = useCallback(
    (params: Record<string, string>) => {
      const url = new URLSearchParams()
      // Preserve query
      const q = 'q' in params ? params.q : currentQuery
      if (q) url.set('q', q)
      // Category
      const cat = 'category' in params ? params.category : currentCategory
      if (cat) url.set('category', cat)
      // Sort
      const sort = 'sort' in params ? params.sort : currentSort
      if (sort && sort !== 'latest') url.set('sort', sort)

      const str = url.toString()
      startTransition(() => {
        router.push(`/posts${str ? `?${str}` : ''}`, { scroll: false })
      })
    },
    [router, currentCategory, currentSort, currentQuery],
  )

  const hasActiveFilters = Boolean(currentQuery || currentCategory || currentSort !== 'latest')

  return (
    <div className={cn('space-y-3', isPending && 'opacity-60 pointer-events-none transition-opacity')}>
      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => navigate({ category: '', sort: 'latest', q: '' })}
          className={cn(
            'px-3 py-1.5 text-xs rounded-full border transition-colors',
            !currentCategory
              ? 'bg-accent text-accent-foreground border-accent'
              : 'border-border hover:bg-muted text-muted-foreground',
          )}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() =>
              navigate({
                category: cat.slug === currentCategory ? '' : cat.slug,
              })
            }
            className={cn(
              'px-3 py-1.5 text-xs rounded-full border transition-colors',
              currentCategory === cat.slug
                ? 'bg-accent text-accent-foreground border-accent'
                : 'border-border hover:bg-muted text-muted-foreground',
            )}
          >
            {cat.title}
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>Sort:</span>
        {[
          { label: 'Latest', value: 'latest' },
          { label: 'Most Voted', value: 'votes' },
          { label: 'Oldest', value: 'oldest' },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => navigate({ sort: opt.value })}
            className={cn(
              'px-2 py-1 rounded transition-colors',
              currentSort === opt.value
                ? 'bg-accent text-accent-foreground'
                : 'hover:bg-muted',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Active filters indicator */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate({ category: '', sort: 'latest', q: '' })}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3 w-3" />
            Clear all filters
          </button>
        </div>
      )}
    </div>
  )
}
