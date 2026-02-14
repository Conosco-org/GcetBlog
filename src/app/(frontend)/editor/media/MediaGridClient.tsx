'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import type { Media } from '@/payload-types'
import { SearchInput } from '@/components/base/SearchInput'
import { FilterBar } from '@/components/base/FilterBar'
import { EmptyState } from '@/components/base/EmptyState'
import { Button } from '@/components/ui/button'
import { Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react'

interface MediaGridClientProps {
  media: Media[]
  totalPages: number
  currentPage: number
  totalItems: number
  pageSize: number
  query: string
  sortParam: string
}

export function MediaGridClient({
  media,
  totalPages,
  currentPage,
  totalItems,
  pageSize,
  query,
  sortParam,
}: MediaGridClientProps) {
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

  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  return (
    <div className="space-y-4">
      {/* Search + Sort */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchInput
          placeholder="Search files by name..."
          defaultValue={query}
          paramName="q"
          className="flex-1 max-w-md"
        />
        <FilterBar
          filters={[
            {
              paramName: 'sort',
              label: 'Sort',
              options: [
                { label: 'Newest First', value: '' },
                { label: 'Oldest First', value: 'createdAt' },
                { label: 'Name A-Z', value: 'filename' },
                { label: 'Name Z-A', value: '-filename' },
                { label: 'Largest First', value: '-filesize' },
                { label: 'Smallest First', value: 'filesize' },
              ],
            },
          ]}
        />
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        {totalItems > 0
          ? `Showing ${startItem}–${endItem} of ${totalItems} files`
          : '0 files'}
      </p>

      {/* Media Grid */}
      {media.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title="No media files found"
          description={
            query
              ? 'Try adjusting your search'
              : 'Upload your first media file to get started'
          }
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {media.map((item) => (
            <div key={item.id} className="group relative">
              <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-2">
                {item.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.url}
                    alt={item.alt || item.filename || 'Media file'}
                    className="w-full h-full object-cover group-hover:scale-110 transition"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              <p className="text-xs font-medium truncate">{item.filename || 'Untitled'}</p>
              <p className="text-xs text-muted-foreground">
                {item.filesize ? `${(item.filesize / 1024).toFixed(1)} KB` : 'Unknown size'}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => goToPage(currentPage - 1)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => goToPage(currentPage + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
