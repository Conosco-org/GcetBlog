'use client'

import React from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Search, X } from 'lucide-react'

interface ClubsFilterBarProps {
  departments: { label: string; value: string }[]
}

const classificationOptions = [
  { label: 'All', value: '' },
  { label: 'Technical', value: 'technical' },
  { label: 'Cultural', value: 'cultural' },
  { label: 'Sports', value: 'sports' },
  { label: 'Literary', value: 'literary' },
  { label: 'Social', value: 'social' },
  { label: 'Professional', value: 'professional' },
]

export const ClubsFilterBar: React.FC<ClubsFilterBarProps> = ({ departments }) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const query = searchParams.get('q') || ''
  const department = searchParams.get('department') || ''
  const classification = searchParams.get('classification') || ''

  const hasFilters = Boolean(query || department || classification)

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete('page')
    const qs = params.toString()
    router.push(`${pathname}${qs ? `?${qs}` : ''}`)
  }

  const clearAll = () => {
    router.push(pathname)
  }

  const deptOptions = [{ label: 'All Departments', value: '' }, ...departments]

  return (
    <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search clubs..."
          defaultValue={query}
          onChange={(e) => {
            const timer = setTimeout(() => updateParams('q', e.target.value), 300)
            return () => clearTimeout(timer)
          }}
          className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
      </div>

      {/* Department filter */}
      <select
        value={department}
        onChange={(e) => updateParams('department', e.target.value)}
        className="px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent/30"
      >
        {deptOptions.map((d) => (
          <option key={d.value} value={d.value}>
            {d.label}
          </option>
        ))}
      </select>

      {/* Classification pills */}
      <div className="flex items-center gap-1">
        {classificationOptions.map((c) => (
          <button
            key={c.value}
            onClick={() => updateParams('classification', c.value)}
            className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
              classification === c.value || (!classification && !c.value)
                ? 'bg-accent text-accent-foreground font-medium'
                : 'bg-muted text-muted-foreground hover:bg-accent/10'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Clear */}
      {hasFilters && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-3 w-3" />
          Clear
        </button>
      )}
    </div>
  )
}
