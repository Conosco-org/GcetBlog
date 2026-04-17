'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/frontend/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/frontend/components/ui/select'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  totalDocs: number
  limit: number
  hasPrevPage: boolean
  hasNextPage: boolean
  showingCount: number
}

export function PaginationControls({
  currentPage,
  totalPages,
  totalDocs,
  limit,
  hasPrevPage,
  hasNextPage,
  showingCount,
}: PaginationControlsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', newPage.toString())
    router.push(`?${params.toString()}`)
  }

  const handleLimitChange = (newLimit: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('limit', newLimit)
    params.set('page', '1') // Reset to first page when changing limit
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="px-4 sm:px-6 py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <p className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
          Showing {showingCount} of {totalDocs}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
            Per page:
          </span>
          <Select value={limit.toString()} onValueChange={handleLimitChange}>
            <SelectTrigger className="w-[70px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-xs sm:text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!hasPrevPage}
            onClick={() => handlePageChange(currentPage - 1)}
            title="Previous"
            aria-label="Previous"
          >
            <ChevronLeft className="w-4 h-4 sm:mr-1" />
            <span className="hidden sm:inline">Previous</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!hasNextPage}
            onClick={() => handlePageChange(currentPage + 1)}
            title="Next"
            aria-label="Next"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4 sm:ml-1" />
          </Button>
        </div>
      </div>
    </div>
  )
}
