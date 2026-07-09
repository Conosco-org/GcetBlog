'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/frontend/components/ui/table'
import { Button } from '@frontend/components/ui/button'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { EmptyState } from './EmptyState'
import { cn } from '@/frontend/lib/utils'
import type { LucideIcon } from 'lucide-react'

export interface Column<T> {
  /** Unique key for the column */
  key: string
  /** Column header label */
  header: React.ReactNode
  /** Render function for the cell content */
  render: (item: T) => React.ReactNode
  /** Additional className for the column */
  className?: string
}

interface DataTableProps<T> {
  /** Column definitions */
  columns: Column<T>[]
  /** Current page data */
  data: T[]
  /** Total number of pages */
  totalPages: number
  /** Current page number (1-based) */
  currentPage: number
  /** Total number of items (optional, for display) */
  totalItems?: number
  /** Per-page limit (optional, for display) */
  pageSize?: number
  /** Whether data is currently loading */
  isLoading?: boolean
  /** Empty state configuration */
  emptyState?: {
    icon?: LucideIcon
    title: string
    description?: string
    action?: React.ReactNode
  }
  /** Additional className */
  className?: string
  /** Unique key extractor for rows */
  getRowKey?: (item: T, index: number) => string
  /** Optional mobile card renderer - shown on small screens instead of the table */
  mobileRender?: (item: T, index: number) => React.ReactNode
}

export function DataTable<T>({
  columns,
  data,
  totalPages,
  currentPage,
  totalItems,
  pageSize,
  isLoading = false,
  emptyState,
  className,
  getRowKey,
  mobileRender,
}: DataTableProps<T>) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (page > 1) {
      params.set('page', page.toString())
    } else {
      params.delete('page')
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  if (!isLoading && data.length === 0 && emptyState) {
    return (
      <EmptyState
        icon={emptyState.icon}
        title={emptyState.title}
        description={emptyState.description}
        action={emptyState.action}
      />
    )
  }

  const startItem = totalItems ? (currentPage - 1) * (pageSize || data.length) + 1 : null
  const endItem = totalItems ? Math.min(currentPage * (pageSize || data.length), totalItems) : null

  return (
    <div className={cn('space-y-4', className)}>
      {/* Mobile card view - shown when mobileRender is provided */}
      {mobileRender && (
        <div className="md:hidden space-y-3">
          {isLoading ? (
            Array.from({ length: pageSize || 5 }).map((_, i) => (
              <div key={`mobile-loading-${i}`} className="rounded-lg border bg-card p-4 space-y-3">
                <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                <div className="h-3 bg-muted animate-pulse rounded w-1/3" />
              </div>
            ))
          ) : (
            data.map((item, index) => (
              <div key={getRowKey ? getRowKey(item, index) : index}>
                {mobileRender(item, index)}
              </div>
            ))
          )}
        </div>
      )}

      {/* Desktop table view */}
      <div className={cn('rounded-md border overflow-x-auto', mobileRender && 'hidden md:block')}>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key} className={col.className}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Minimal loading rows
              Array.from({ length: pageSize || 5 }).map((_, i) => (
                <TableRow key={`loading-${i}`}>
                  {columns.map((col) => (
                    <TableCell key={col.key}>
                      <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              data.map((item, index) => (
                <TableRow key={getRowKey ? getRowKey(item, index) : index}>
                  {columns.map((col) => (
                    <TableCell key={col.key} className={col.className}>
                      {col.render(item)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            {totalItems && startItem && endItem ? (
              <>
                Showing {startItem}-{endItem} of {totalItems}
              </>
            ) : (
              <>
                Page {currentPage} of {totalPages}
              </>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={currentPage <= 1}
              onClick={() => goToPage(1)}
              aria-label="First page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={currentPage <= 1}
              onClick={() => goToPage(currentPage - 1)}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Page number buttons */}
            {getPageNumbers(currentPage, totalPages).map((pageNum, i) =>
              pageNum === -1 ? (
                <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground">
                  ...
                </span>
              ) : (
                <Button
                  key={pageNum}
                  variant={pageNum === currentPage ? 'default' : 'outline'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => goToPage(pageNum)}
                  aria-label={`Page ${pageNum}`}
                  aria-current={pageNum === currentPage ? 'page' : undefined}
                >
                  {pageNum}
                </Button>
              ),
            )}

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={currentPage >= totalPages}
              onClick={() => goToPage(currentPage + 1)}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={currentPage >= totalPages}
              onClick={() => goToPage(totalPages)}
              aria-label="Last page"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Generate page numbers with ellipsis for large page counts.
 * Returns array where -1 represents an ellipsis.
 */
function getPageNumbers(current: number, total: number): number[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages: number[] = []

  // Always show first page
  pages.push(1)

  if (current > 3) {
    pages.push(-1) // ellipsis
  }

  // Show pages around current
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (current < total - 2) {
    pages.push(-1) // ellipsis
  }

  // Always show last page
  pages.push(total)

  return pages
}
