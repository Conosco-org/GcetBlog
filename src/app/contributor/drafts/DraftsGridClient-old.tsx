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
import { markNotificationAsRead } from './actions'
import { useToast } from '@/hooks/use-toast'

interface RejectionNotification {
  id: string
  postTitle: string
  reason: string
  createdAt: string
  isRead?: boolean | null
}

interface DraftsGridClientProps {
  drafts: Post[]
  rejections: RejectionNotification[]
  totalPages: number
  currentPage: number
  totalItems: number
  pageSize: number
  query: string
}

export function DraftsGridClient({
  drafts,
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
  const { toast } = useToast()
  const [dismissedRejections, setDismissedRejections] = useState<Set<string>>(new Set())
  const [dismissingId, setDismissingId] = useState<string | null>(null)

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (page > 1) {
      params.set('page', page.toString())
    } else {
      params.delete('page')
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleDismissRejection = async (rejectionId: string) => {
    setDismissingId(rejectionId)

    try {
      const result = await markNotificationAsRead(rejectionId)

      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        })
        setDismissedRejections(prev => new Set(prev).add(rejectionId))
        setTimeout(() => router.refresh(), 500)
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive',
        })
        setDismissingId(null)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to dismiss notification',
        variant: 'destructive',
      })
      setDismissingId(null)
    }
  }

  const visibleRejections = rejections.filter(r => !dismissedRejections.has(r.id))

  // Categorize drafts into 3 sections
  const rejectedPosts = drafts.filter(post => post.reviewStatus === 'rejected')
  const requestingChangesPosts = drafts.filter(post => post.reviewStatus === 'draft' && post.editorFeedback)
  const currentDrafts = drafts.filter(post => post.reviewStatus === 'draft' && !post.editorFeedback)

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
        {visibleRejections.length > 0 && ` • ${visibleRejections.length} ${visibleRejections.length === 1 ? 'rejection' : 'rejections'}`}
      </p>

      {/* Rejection Notifications */}
      {visibleRejections.length > 0 && (
        <div className="space-y-3 mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-600" />
            Rejected Posts
          </h3>
          {visibleRejections.map((rejection) => (
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
                  onClick={() => handleDismissRejection(rejection.id)}
                  disabled={dismissingId === rejection.id}
                  className="w-full"
                >
                  {dismissingId === rejection.id ? 'Dismissing...' : 'Mark as Read'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Rejected Posts Section */}
      {rejectedPosts.length > 0 && (
        <div className="space-y-3 mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-600" />
            Rejected Posts ({rejectedPosts.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rejectedPosts.map((post) => (
              <Card key={post.id} className="border-red-300 dark:border-red-700 bg-red-50/50 dark:bg-red-950/20">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>
                    <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-400 dark:border-red-700 flex-shrink-0">
                      Rejected
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Last edited: {formatDateTime(post.updatedAt)}
                  </p>
                  {post.editorFeedback && (
                    <div className="mt-2 p-3 bg-red-100 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md">
                      <p className="text-xs font-semibold text-red-900 dark:text-red-300 mb-1">Editor Feedback:</p>
                      <p className="text-sm text-red-800 dark:text-red-400">{post.editorFeedback}</p>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <Button variant="default" size="sm" asChild className="w-full" title="Edit post" aria-label="Edit post">
                    <Link href={`/editor/posts/${post.id}/edit`}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit & Resubmit
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Requesting Changes Section */}
      {requestingChangesPosts.length > 0 && (
        <div className="space-y-3 mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            Requesting Changes ({requestingChangesPosts.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requestingChangesPosts.map((post) => (
              <Card key={post.id} className="border-orange-300 dark:border-orange-700 bg-orange-50/50 dark:bg-orange-950/20">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>
                    <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-700 flex-shrink-0">
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
                  <Button variant="default" size="sm" asChild className="w-full" title="Continue editing" aria-label="Continue editing">
                    <Link href={`/editor/posts/${post.id}/edit`}>
                      <Edit className="h-4 w-4 mr-1" />
                      Continue Editing
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Current Drafts Section */}
      {currentDrafts.length > 0 && (
        <div className="space-y-3 mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Current Drafts ({currentDrafts.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentDrafts.map((post) => (
              <Card key={post.id} className="hover:border-primary transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>
                    <Badge variant="outline">Draft</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Last edited: {formatDateTime(post.updatedAt)}
                  </p>
                </CardHeader>
                <CardContent>
                  <Button variant="default" size="sm" asChild className="w-full" title="Continue editing" aria-label="Continue editing">
                    <Link href={`/editor/posts/${post.id}/edit`}>
                      <Edit className="h-4 w-4 mr-1" />
                      Continue
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {drafts.length === 0 && (
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
