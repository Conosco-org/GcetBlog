import { Skeleton } from '@/components/ui/skeleton'

interface PageSkeletonProps {
  /** Show stat cards skeleton */
  showStats?: boolean
  /** Number of stat cards */
  statsCount?: number
  /** Show table skeleton */
  showTable?: boolean
  /** Number of table rows */
  tableRows?: number
  /** Number of table columns */
  tableColumns?: number
  /** Show grid skeleton (for media/drafts) */
  showGrid?: boolean
  /** Number of grid items */
  gridItems?: number
  /** Show search + filter bar */
  showFilters?: boolean
}

export function PageSkeleton({
  showStats = false,
  statsCount = 4,
  showTable = false,
  tableRows = 8,
  tableColumns = 5,
  showGrid = false,
  gridItems = 12,
  showFilters = false,
}: PageSkeletonProps) {
  return (
    <div className="p-6 space-y-6" aria-busy="true" aria-label="Loading page content">
      {/* Page Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Stat cards */}
      {showStats && (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: statsCount }).map((_, i) => (
            <div key={i} className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-5 rounded" />
              </div>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>
      )}

      {/* Search + Filter bar */}
      {showFilters && (
        <div className="flex flex-col sm:flex-row gap-3">
          <Skeleton className="h-9 w-64 rounded-md" />
          <Skeleton className="h-9 w-36 rounded-md" />
        </div>
      )}

      {/* Table skeleton */}
      {showTable && (
        <div className="rounded-md border">
          <div className="border-b p-4 flex gap-4">
            {Array.from({ length: tableColumns }).map((_, i) => (
              <Skeleton key={`hdr-${i}`} className="h-4 flex-1" style={{ maxWidth: i === 0 ? '200px' : undefined }} />
            ))}
          </div>
          {Array.from({ length: tableRows }).map((_, rowIdx) => (
            <div key={`row-${rowIdx}`} className="border-b last:border-0 p-4 flex gap-4">
              {Array.from({ length: tableColumns }).map((_, colIdx) => (
                <Skeleton
                  key={`cell-${rowIdx}-${colIdx}`}
                  className="h-4 flex-1"
                  style={{ maxWidth: colIdx === 0 ? '200px' : undefined }}
                />
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Grid skeleton */}
      {showGrid && (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {Array.from({ length: gridItems }).map((_, i) => (
            <div key={`grid-${i}`} className="rounded-lg border overflow-hidden">
              <Skeleton className="aspect-square w-full" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
