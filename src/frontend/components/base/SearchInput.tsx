'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useEffect, useRef, useState, useCallback } from 'react'
import { Input } from '@/frontend/components/ui/input'
import { Search, X } from 'lucide-react'
import { cn } from '@/frontend/lib/utils'

interface SearchInputProps {
  /** Placeholder text */
  placeholder?: string
  /** Default value (from searchParams) */
  defaultValue?: string
  /** URL param name to sync with */
  paramName?: string
  /** Debounce delay in ms */
  debounceMs?: number
  /** Additional className */
  className?: string
  /** Called when search value changes (after debounce) */
  onSearch?: (value: string) => void
}

export function SearchInput({
  placeholder = 'Search...',
  defaultValue = '',
  paramName = 'q',
  debounceMs = 300,
  className,
  onSearch,
}: SearchInputProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(defaultValue)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync with URL on mount
  useEffect(() => {
    const paramValue = searchParams.get(paramName) || ''
    setValue(paramValue)
  }, [searchParams, paramName])

  const updateUrl = useCallback(
    (newValue: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (newValue) {
        params.set(paramName, newValue)
      } else {
        params.delete(paramName)
      }
      // Reset to page 1 on new search
      params.delete('page')
      router.push(`${pathname}?${params.toString()}`)
      onSearch?.(newValue)
    },
    [router, pathname, searchParams, paramName, onSearch],
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setValue(newValue)

    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(() => {
      updateUrl(newValue)
    }, debounceMs)
  }

  const handleClear = () => {
    setValue('')
    updateUrl('')
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleClear()
    }
  }

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        ref={inputRef}
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="pl-9 pr-9"
        aria-label={placeholder}
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Clear search"
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
