'use client'

import { useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import type { Post } from '@/payload-types'
import { SearchInput } from '@/components/base/SearchInput'
import { EmptyState } from '@/components/base/EmptyState'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatDateTime } from '@/utilities/formatDateTime'
import Link from 'next/link'
import { Edit, FileText, ChevronLeft, ChevronRight, Plus, AlertCircle, XCircle, Clock, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [postToDelete, setPostToDelete] = useState<Post | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (page > 1) {
      params.set('page', page.toString())
    } else {
      params.delete('page')
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleDeleteClick = (post: Post) => {
    setPostToDelete(post)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!postToDelete) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/posts/${postToDelete.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Draft deleted successfully',
        })
        setDeleteDialogOpen(false)
        setPostToDelete(null)
        router.refresh()
      } else {
        const data = await response.json()
        toast({
          title: 'Error',
          description: data.error || 'Failed to delete draft',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete draft',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Categorize drafts into sections
  console.log('🔵 [Contributor Drafts Client] Received drafts:', {
    totalDrafts: drafts.length,
    drafts: drafts.map(p => ({
      id: p.id,
      title: p.title,
      reviewStatus: p.reviewStatus,
      _status: p._status,
      hasEditorFeedback: !!p.editorFeedback,
    }))
  })

  const currentDrafts = drafts.filter(post => 
    post.reviewStatus === 'draft'
  )
  const requestingChangesPosts = drafts.filter(post => 
    post.reviewStatus === 'requesting_changes'
  )
  const pendingReviewPosts = drafts.filter(post => 
    post.reviewStatus === 'pending_review'
  )
  const rejectedPosts = drafts.filter(post => 
    post.reviewStatus === 'rejected'
  )

  console.log('🔵 [Contributor Drafts Client] Filtered results:', {
    currentDrafts: currentDrafts.length,
    requestingChanges: requestingChangesPosts.length,
    pendingReview: pendingReviewPosts.length,
    rejected: rejectedPosts.length,
  })

  const renderPostCard = (post: Post, showFeedback: boolean = false, isPending: boolean = false) => (
    <Card key={post.id} className={`hover:border-primary transition-colors ${showFeedback ? 'border-orange-300 dark:border-orange-700 bg-orange-50/50 dark:bg-orange-950/20' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>
          <div className="flex gap-1 flex-shrink-0">
            {showFeedback && (
              <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-700">
                <AlertCircle className="w-3 h-3 mr-1" />
                Feedback
              </Badge>
            )}
            {isPending && (
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-700">
                <Clock className="w-3 h-3 mr-1" />
                Pending
              </Badge>
            )}
            {!showFeedback && !isPending && (
              <Badge variant="outline">Draft</Badge>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Last edited: {formatDateTime(post.updatedAt)}
        </p>
        {showFeedback && post.editorFeedback && (
          <div className="mt-2 p-3 bg-orange-100 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-md">
            <p className="text-xs font-semibold text-orange-900 dark:text-orange-300 mb-1">Editor Feedback:</p>
            <p className="text-sm text-orange-800 dark:text-orange-400">{post.editorFeedback}</p>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          {!isPending && (
            <>
              <Button variant="default" size="sm" className="flex-1" asChild>
                <Link href={`/editor/posts/${post.id}/edit`} prefetch={false}>
                  <Edit className="h-4 w-4 mr-1" />
                  {showFeedback ? 'Edit & Resubmit' : 'Edit'}
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/api/draft?slug=${post.slug}&collection=posts`} target="_blank" rel="noopener noreferrer">
                  <FileText className="h-4 w-4" />
                </Link>
              </Button>
            </>
          )}
          {isPending && (
            <>
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <Link href={`/api/draft?slug=${post.slug}&collection=posts`} target="_blank" rel="noopener noreferrer">
                  <FileText className="h-4 w-4 mr-1" />
                  Preview
                </Link>
              </Button>
            </>
          )}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleDeleteClick(post)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )

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

      {/* Tabs for Drafts */}
      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="current">
            Current Drafts ({currentDrafts.length})
          </TabsTrigger>
          <TabsTrigger value="changes">
            Requesting Changes ({requestingChangesPosts.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending Review ({pendingReviewPosts.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejectedPosts.length + rejections.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="mt-4">
          {currentDrafts.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No current drafts"
              description={query ? 'Try adjusting your search' : 'Start writing a new post'}
              action={
                <Button asChild>
                  <Link href="/contributor/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Draft
                  </Link>
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentDrafts.map((post) => renderPostCard(post, false, false))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="changes" className="mt-4">
          {requestingChangesPosts.length === 0 ? (
            <EmptyState
              icon={AlertCircle}
              title="No posts requesting changes"
              description="Posts with editor feedback will appear here"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {requestingChangesPosts.map((post) => renderPostCard(post, true, false))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="mt-4">
          {pendingReviewPosts.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="No posts pending review"
              description="Submit a draft for review to see it here"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingReviewPosts.map((post) => renderPostCard(post, false, true))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="mt-4">
          {rejectedPosts.length === 0 && rejections.length === 0 ? (
            <EmptyState
              icon={XCircle}
              title="No rejected posts"
              description="Rejected posts will appear here"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Rejected posts from database */}
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
                        <p className="text-xs font-semibold text-red-900 dark:text-red-300 mb-1">Reason for Rejection:</p>
                        <p className="text-sm text-red-800 dark:text-red-400">{post.editorFeedback}</p>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild className="flex-1">
                        <Link href={`/api/draft?slug=${post.slug}&collection=posts`} target="_blank">
                          <FileText className="h-4 w-4 mr-1" />
                          Preview
                        </Link>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteClick(post)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* Rejection notifications (deleted posts) */}
              {rejections.map((rejection) => (
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
                        Deleted
                      </Badge>
                    </div>
                    <div className="mt-3 p-3 bg-red-100 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md">
                      <p className="text-xs font-semibold text-red-900 dark:text-red-300 mb-1">Reason for Rejection:</p>
                      <p className="text-sm text-red-800 dark:text-red-400">{rejection.reason}</p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground italic">This post was permanently deleted</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Draft</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{postToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
