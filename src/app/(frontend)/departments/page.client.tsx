'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback } from 'react'

export default function DepartmentsPageClient() {
  return null
}

export function DepartmentsFilterBar({
  categories,
}: {
  categories: { label: string; value: string }[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const category = searchParams.get('category') || ''
  const query = searchParams.get('q') || ''

  const update = useCallback(
    (key: string, value: string) => {
      const sp = new URLSearchParams(searchParams.toString())
      if (value) {
        sp.set(key, value)
      } else {
        sp.delete(key)
      }
      sp.delete('page')
      router.push(`/departments?${sp.toString()}`)
    },
    [router, searchParams],
  )

  const categoryOptions = [{ label: 'All Categories', value: '' }, ...categories]

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Search */}
      <input
        type="search"
        placeholder="Search departments…"
        defaultValue={query}
        onChange={(e) => update('q', e.target.value)}
        className="px-3 py-2 text-sm rounded-lg border border-border bg-background w-60 focus:outline-none focus:ring-2 focus:ring-accent/40"
      />

      {/* Category filter */}
      <select
        value={category}
        onChange={(e) => update('category', e.target.value)}
        className="px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent/40"
        aria-label="Filter by category"
      >
        {categoryOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
