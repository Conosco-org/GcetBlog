'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import type { Post } from '@/payload-types'
import { SearchInput } from '@/components/base/SearchInput'
import { EmptyState } from '@/components/base/EmptyState'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/utilities/formatDateTime'
import Link from 'next/link'
import { Edit, FileText, ChevronLeft, ChevronRight } from 'lucide-react'

interface DraftsGridClientProps {
  drafts: Post[]
  totalPages: number
  currentPage: number
  totalItems: number
  pageSize: number
  query: string
}

export function DraftsGridClient({
  drafts,
  totalPages,
  currentPage,
  totalItems,
  pageSize: _pageSize,
  query,
}: DraftsGridClientProps) {
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

  return (
    <div className="space-y-4">
      <SearchInput
        placeholder="Search drafts..."
        defaultValue={query}
        paramName="q"
        className="max-w-md"
      />

      <p className="text-sm text-muted-foreground">
        {totalItems} {totalItems === 1 ? 'draft' : 'drafts'}
      </p>

      {drafts.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No drafts found"
          description={query ? 'Try adjusting your search' : 'All your draft posts will appear here'}
          action={
            <Button asChild>
              <Link href="/contributor/create">Create New Draft</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {drafts.map((post) => (
            <Card key={post.id} className="hover:border-primary transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>
                  <Badge variant="outline" className="flex-shrink-0">Draft</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Last edited: {formatDateTime(post.updatedAt)}
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button variant="default" size="sm" asChild className="flex-1">
                    <Link href={`/editor/posts/${post.id}/edit`}>
                      <Edit className="h-4 w-4 mr-1" />
                      Continue
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
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
