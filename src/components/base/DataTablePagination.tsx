'use client'

/**
 * DataTable Pagination (URL-based)
 *
 * Client component for pagination that syncs to URL searchParams.
 * Used for server-side paginated data tables.
 */

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

interface DataTablePaginationProps {
  currentPage: number
  totalPages: number
  pageParam?: string // URL param name (default: 'page')
}

export function DataTablePagination({
  currentPage,
  totalPages,
  pageParam = 'page',
}: DataTablePaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (page === 1) {
      params.delete(pageParam)
    } else {
      params.set(pageParam, page.toString())
    }
    router.push(`?${params.toString()}`, { scroll: false })
  }

  const getPageNumbers = (current: number, total: number): (number | -1)[] => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

    if (current <= 3) return [1, 2, 3, 4, -1, total]
    if (current >= total - 2) return [1, -1, total - 3, total - 2, total - 1, total]

    return [1, -1, current - 1, current, current + 1, -1, total]
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
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
              …
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
  )
}
