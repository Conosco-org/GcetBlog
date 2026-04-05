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
import { Edit, FileText, ChevronLeft, ChevronRight, Plus, AlertCircle, XCircle } from 'lucide-react'
import { useState } from 'react'

interface RejectionNotification {
  id: string
  postTitle: string
  reason: string
  createdAt: string
  isRead?: boolean | null
}

interface DraftsGridClientProps {
  currentDrafts: Post[]
  requestingChanges: Post[]
  rejections: RejectionNotification[]
  totalPages: number
  currentPage: number
  totalItems: number
  pageSize: number
  query: string
}

export function DraftsGridClient({
  currentDrafts,
  requestingChanges,
  rejections,
  totalPages,
  currentPage,
  totalItems,
  pageSize: _pageSize,
  query,
}: DraftsGridClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [readRejections, setReadRejections] = useState<Set<string>>(new Set())
  const [markingAsRead, setMarkingAsRead] = useState<Set<string>>(new Set())

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (page > 1) {
      params.set('page', page.toString())
    } else {
      params.delete('page')
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleMarkAsRead = async (rejectionId: string) => {
    // Prevent double-click
    if (markingAsRead.has(rejectionId)) {
      return
    }

    setMarkingAsRead(prev => new Set(prev).add(rejectionId))
    
    try {
      const response = await fetch(`/api/rejection-notifications/${rejectionId}/mark-read`, {
        method: 'PATCH',
      })

      if (response.ok) {
        setReadRejections(prev => new Set(prev).add(rejectionId))
      }
    } catch (error) {
      console.error('Failed to mark rejection as read:', error)
    } finally {
      setMarkingAsRead(prev => {
        const newSet = new Set(prev)
        newSet.delete(rejectionId)
        return newSet
      })
    }
  }

  const unreadRejections = rejections.filter(r => !r.isRead && !readRejections.has(r.id))

  return (
    <div className="space-y-6">
      <SearchInput
        placeholder="Search drafts..."
        defaultValue={query}
        paramName="q"
        className="max-w-md"
      />

      {/* Rejected Posts Section */}
      {unreadRejections.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-red-600 dark:text-red-400">
            <XCircle className="w-5 h-5" />
            Rejected Posts ({unreadRejections.length})
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {unreadRejections.map((rejection) => (
              <Card key={rejection.id} className="border-red-300 dark:border-red-700 bg-red-50/50 dark:bg-red-950/20">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2 flex items-center gap-2">
                        <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                        {rejection.postTitle}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        Rejected: {formatDateTime(rejection.createdAt)}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-400 dark:border-red-700 flex-shrink-0">
                      Rejected
                    </Badge>
                  </div>
                  <div className="mt-3 p-3 bg-red-100 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md">
                    <p className="text-xs font-semibold text-red-900 dark:text-red-300 mb-1">Reason for Rejection:</p>
                    <p className="text-sm text-red-800 dark:text-red-400">{rejection.reason}</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMarkAsRead(rejection.id)}
                    disabled={markingAsRead.has(rejection.id)}
                    className="w-full"
                  >
                    {markingAsRead.has(rejection.id) ? 'Marking...' : 'Mark as Read'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Requesting Changes Section */}
      {requestingChanges.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-orange-600 dark:text-orange-400">
            <AlertCircle className="w-5 h-5" />
            Requesting Changes ({requestingChanges.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requestingChanges.map((post) => (
              <Card key={post.id} className="border-orange-300 dark:border-orange-700 bg-orange-50/50 dark:bg-orange-950/20">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-700 flex-shrink-0">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Feedback
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Last edited: {formatDateTime(post.updatedAt)}
                  </p>
                  {post.editorFeedback && (
                    <div className="mt-2 p-3 bg-orange-100 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-md">
                      <p className="text-xs font-semibold text-orange-900 dark:text-orange-300 mb-1">Editor Feedback:</p>
                      <p className="text-sm text-orange-800 dark:text-orange-400">{post.editorFeedback}</p>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <Button variant="default" size="sm" asChild className="w-full">
                    <Link href={`/editor/posts/${post.id}/edit`} prefetch={false}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit & Resubmit
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Current Drafts Section */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Current Drafts ({totalItems})
        </h3>
        {currentDrafts.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No drafts found"
            description={query ? 'Try adjusting your search' : 'All your draft posts will appear here'}
            action={
              <Button asChild>
                <Link href="/contributor/create">
                  <Plus className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Create New Draft</span>
                </Link>
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentDrafts.map((post) => (
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
                  <Button variant="default" size="sm" asChild className="w-full">
                    <Link href={`/editor/posts/${post.id}/edit`} prefetch={false}>
                      <Edit className="h-4 w-4 mr-2" />
                      Continue
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

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
              title="Previous"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Previous</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => goToPage(currentPage + 1)}
              title="Next"
              aria-label="Next page"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4 sm:ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
