'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/utilities/ui'

interface FilterOption {
  label: string
  value: string
}

interface FilterConfig {
  /** URL param name */
  paramName: string
  /** Display label */
  label: string
  /** Available options (include an "All" option with value "" to clear) */
  options: FilterOption[]
}

interface FilterBarProps {
  /** Array of filter configurations */
  filters: FilterConfig[]
  /** Additional className */
  className?: string
}

export function FilterBar({ filters, className }: FilterBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleFilterChange = (paramName: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    // "_all" is a sentinel for "no filter" since Radix Select doesn't support empty values
    if (value && value !== '_all') {
      params.set(paramName, value)
    } else {
      params.delete(paramName)
    }
    // Reset to page 1 when filter changes
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      {filters.map((filter) => {
        const currentValue = searchParams.get(filter.paramName) || ''
        return (
          <div key={filter.paramName} className="flex items-center gap-2">
            <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">
              {filter.label}:
            </label>
            <Select
              value={currentValue}
              onValueChange={(val) => handleFilterChange(filter.paramName, val)}
            >
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder={`All ${filter.label}`} />
              </SelectTrigger>
              <SelectContent>
                {filter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value || '_all'}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )
      })}
    </div>
  )
}
