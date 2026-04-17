'use client'

import { useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import type { Post } from '@shared/types/payload-types'
import { SearchInput } from '@frontend/components/base/SearchInput'
import { EmptyState } from '@frontend/components/base/EmptyState'
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/card'
import { Badge } from '@frontend/components/ui/badge'
import { Button } from '@frontend/components/ui/button'
import { formatDateTime } from '@frontend/lib/format-date-time'
import Link from 'next/link'
import { Edit, FileText, ChevronLeft, ChevronRight, Plus, Trash2, Eye } from 'lucide-react'
import { useToast } from '@frontend/components/ui/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@frontend/components/ui/alert-dialog'

interface EditorDraftsClientProps {
  drafts: Post[]
  totalPages: number
  currentPage: number
  totalItems: number
  pageSize: number
  query: string
}

export function EditorDraftsClient({
  drafts,
  totalPages,
  currentPage,
  totalItems,
  query,
}: EditorDraftsClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [postToDelete, setPostToDelete] = useState<Post | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [publishDialogOpen, setPublishDialogOpen] = useState(false)
  const [postToPublish, setPostToPublish] = useState<Post | null>(null)
  const [isPublishing, setIsPublishing] = useState(false)

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
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete draft',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handlePublishClick = (post: Post) => {
    setPostToPublish(post)
    setPublishDialogOpen(true)
  }

  const handlePublishConfirm = async () => {
    if (!postToPublish) return

    setIsPublishing(true)
    try {
      const response = await fetch(`/api/posts/${postToPublish.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          _status: 'published',
        }),
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Post published successfully',
        })
        setPublishDialogOpen(false)
        setPostToPublish(null)
        router.refresh()
      } else {
        const data = await response.json()
        toast({
          title: 'Error',
          description: data.error || 'Failed to publish post',
          variant: 'destructive',
        })
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to publish post',
        variant: 'destructive',
      })
    } finally {
      setIsPublishing(false)
    }
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
          title="No drafts"
          description={query ? 'Try adjusting your search' : 'Start writing a new post'}
          action={
            <Button asChild>
              <Link href="/editor/posts/create">
                <Plus className="h-4 w-4 mr-2" />
                Create New Post
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {drafts.map((post) => (
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
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Button variant="default" size="sm" className="flex-1" asChild>
                      <Link href={`/editor/posts/${post.id}/edit`} prefetch={false}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/api/draft?slug=${post.slug}&collection=posts`} target="_blank" rel="noopener noreferrer">
                        <FileText className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="default" 
                      size="sm"
                      className="flex-1"
                      onClick={() => handlePublishClick(post)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Publish
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
              Are you sure you want to delete &ldquo;{postToDelete?.title}&rdquo;? This action cannot be undone.
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

      {/* Publish Confirmation Dialog */}
      <AlertDialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publish Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to publish &ldquo;{postToPublish?.title}&rdquo;? It will be visible to all readers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPublishing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePublishConfirm}
              disabled={isPublishing}
            >
              {isPublishing ? 'Publishing...' : 'Publish'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
