import { cn } from '@/utilities/ui'

interface DataTableSkeletonProps {
  /** Number of columns */
  columns?: number
  /** Number of rows */
  rows?: number
  /** Additional className */
  className?: string
}

export function DataTableSkeleton({
  columns = 5,
  rows = 10,
  className,
}: DataTableSkeletonProps) {
  return (
    <div className={cn('space-y-4', className)} aria-busy="true" aria-label="Loading data">
      {/* Search / Filter bar skeleton */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="h-9 w-64 bg-muted animate-pulse rounded-md" />
        <div className="h-9 w-36 bg-muted animate-pulse rounded-md" />
      </div>

      {/* Table skeleton */}
      <div className="rounded-md border">
        <div className="border-b">
          <div className="flex p-4 gap-4">
            {Array.from({ length: columns }).map((_, i) => (
              <div
                key={`header-${i}`}
                className={`h-4 bg-muted animate-pulse rounded flex-1${i === 0 ? ' max-w-[200px]' : ''}`}
              />
            ))}
          </div>
        </div>
        <div>
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <div
              key={`row-${rowIdx}`}
              className="flex p-4 gap-4 border-b last:border-b-0"
            >
              {Array.from({ length: columns }).map((_, colIdx) => (
                <div
                  key={`cell-${rowIdx}-${colIdx}`}
                  className={`h-4 bg-muted animate-pulse rounded flex-1${colIdx === 0 ? ' max-w-[200px]' : ''}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Pagination skeleton */}
      <div className="flex justify-between items-center">
        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={`page-${i}`}
              className="h-8 w-8 bg-muted animate-pulse rounded"
            />
          ))}
        </div>
      </div>
    </div>
  )
}
