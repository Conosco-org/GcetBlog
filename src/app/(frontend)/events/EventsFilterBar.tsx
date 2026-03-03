'use client'

import React from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Search, Filter, X } from 'lucide-react'

interface EventsFilterBarProps {
  departments: { label: string; value: string }[]
}

const eventTypes = [
  { label: 'All Types', value: '' },
  { label: 'Workshop', value: 'workshop' },
  { label: 'Seminar', value: 'seminar' },
  { label: 'Hackathon', value: 'hackathon' },
  { label: 'Competition', value: 'competition' },
  { label: 'Cultural', value: 'cultural' },
  { label: 'Sports', value: 'sports' },
  { label: 'Conference', value: 'conference' },
  { label: 'Guest Lecture', value: 'guest-lecture' },
]

const statusOptions = [
  { label: 'All', value: '' },
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Ongoing', value: 'ongoing' },
  { label: 'Completed', value: 'completed' },
]

export const EventsFilterBar: React.FC<EventsFilterBarProps> = ({ departments }) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const query = searchParams.get('q') || ''
  const department = searchParams.get('department') || ''
  const type = searchParams.get('type') || ''
  const status = searchParams.get('status') || ''

  const hasFilters = Boolean(query || department || type || status)

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete('page') // Reset pagination on filter change
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
          placeholder="Search events..."
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

      {/* Event type filter */}
      <select
        value={type}
        onChange={(e) => updateParams('type', e.target.value)}
        className="px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent/30"
      >
        {eventTypes.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>

      {/* Status filter */}
      <div className="flex items-center gap-1">
        {statusOptions.map((s) => (
          <button
            key={s.value}
            onClick={() => updateParams('status', s.value)}
            className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
              status === s.value || (!status && !s.value)
                ? 'bg-accent text-accent-foreground font-medium'
                : 'bg-muted text-muted-foreground hover:bg-accent/10'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Clear all */}
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
