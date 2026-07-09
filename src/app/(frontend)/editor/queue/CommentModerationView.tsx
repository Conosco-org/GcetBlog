'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Checkbox } from '@/frontend/components/ui/checkbox'
import { Button } from '@/frontend/components/ui/button'
import { Input } from '@/frontend/components/ui/input'
import { Card, CardContent } from '@/frontend/components/ui/card'
import { Badge } from '@/frontend/components/ui/badge'
import { PaginationControls } from '@/frontend/components/base'
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
} from '@/frontend/components/ui/alert-dialog'
import { Archive, CheckCircle, XCircle, User, FileText, Clock, Loader2 } from 'lucide-react'
import { approveComments, deleteComments } from '@/frontend/features/comments/lib/comment-actions'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import type { Comment } from '@/shared/types/payload-types'

interface CommentModerationViewProps {
  pendingComments: {
    docs: Comment[]
    totalDocs: number
    totalPages: number
    page?: number
    limit?: number
    hasPrevPage?: boolean
    hasNextPage?: boolean
  }
}

export function CommentModerationView({
  pendingComments,
}: CommentModerationViewProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedComments, setSelectedComments] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; commentIds: string[] }>({
    open: false,
    commentIds: [],
  })
  const [isRejecting, setIsRejecting] = useState(false)
  const [isArchiving, setIsArchiving] = useState(false)

  // Filter comments based on search
  const filteredComments = pendingComments.docs.filter((comment) => {
    const searchLower = searchQuery.toLowerCase()
    
    const matchesContent = comment.content?.toLowerCase().includes(searchLower) || false
    
    const authorName = comment.author && typeof comment.author === 'object'
      ? comment.author.name?.toLowerCase() || ''
      : ''
    const matchesAuthor = authorName.includes(searchLower)
    
    const postTitle = comment.post && typeof comment.post === 'object'
      ? comment.post.title?.toLowerCase() || ''
      : ''
    const matchesPost = postTitle.includes(searchLower)
    
    return searchQuery.trim() === '' || matchesContent || matchesAuthor || matchesPost
  })

  const handleSelect = (commentId: string, selected: boolean) => {
    setSelectedComments((prev) =>
      selected ? [...prev, commentId] : prev.filter((id) => id !== commentId)
    )
  }

  const handleSelectAll = (selected: boolean) => {
    setSelectedComments(selected ? filteredComments.map((c) => c.id) : [])
  }

  const handleApprove = async (commentId?: string) => {
    const ids = commentId ? [commentId] : selectedComments
    const result = await approveComments(ids)

    if (result.success) {
      toast({ title: 'Success', description: result.message })
      setSelectedComments([])
      router.refresh()
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
    }
  }

  const handleReject = async (commentId?: string) => {
    const ids = commentId ? [commentId] : selectedComments
    setRejectDialog({ open: true, commentIds: ids })
  }

  const handleArchive = async (commentId?: string) => {
    const ids = commentId ? [commentId] : selectedComments
    if (ids.length === 0 || !confirm(`Archive ${ids.length} pending comment(s)?`)) return
    setIsArchiving(true)
    try {
      const response = await fetch('/api/archive/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'comments', ids }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Failed to archive comments')
      toast({
        title: 'Archive complete',
        description: data.message,
        variant: data.failed?.length ? 'destructive' : 'default',
      })
      setSelectedComments([])
      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to archive comments',
        variant: 'destructive',
      })
    } finally {
      setIsArchiving(false)
    }
  }

  const confirmReject = async () => {
    setIsRejecting(true)
    const result = await deleteComments(rejectDialog.commentIds)

    if (result.success) {
      toast({ title: 'Success', description: result.message })
      setSelectedComments([])
      setRejectDialog({ open: false, commentIds: [] })
      router.refresh()
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
    }
    setIsRejecting(false)
  }

  const allSelected = filteredComments.length > 0 && selectedComments.length === filteredComments.length

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <Input
        type="text"
        placeholder="Search by post, author, or comment content..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="max-w-md"
      />

      {/* Bulk Actions */}
      {selectedComments.length > 0 && (
        <Card className="border-primary/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{selectedComments.length} comment(s) selected</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleApprove()}>
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Approve
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleArchive()} disabled={isArchiving}>
                  <Archive className="w-4 h-4 mr-1" />
                  {isArchiving ? 'Archiving...' : 'Archive'}
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleReject()}>
                  <XCircle className="w-4 h-4 mr-1" />
                  Reject
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setSelectedComments([])}>
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Select All */}
      <div className="flex items-center gap-2 p-3 bg-muted rounded">
        <Checkbox checked={allSelected} onCheckedChange={handleSelectAll} />
        <span className="text-sm font-medium">
          Select all ({filteredComments.length} comments)
        </span>
      </div>

      {/* Comments Grid */}
      {filteredComments.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground bg-muted rounded-md">
          {searchQuery ? 'No comments found matching your search' : 'No pending comments'}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredComments.map((comment) => {
            const author = comment.author && typeof comment.author === 'object' ? comment.author : null
            const post = comment.post && typeof comment.post === 'object' ? comment.post : null
            const isSelected = selectedComments.includes(comment.id)

            return (
              <Card key={comment.id} className={`${isSelected ? 'border-primary' : ''}`}>
                <CardContent className="p-4 space-y-3">
                  {/* Checkbox and Status */}
                  <div className="flex items-start justify-between gap-2">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => handleSelect(comment.id, checked as boolean)}
                    />
                    <Badge variant="outline" className="text-xs">
                      Pending
                    </Badge>
                  </div>

                  {/* Comment Content */}
                  <p className="text-sm line-clamp-3">{comment.content}</p>

                  {/* Author Info */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <User className="w-3 h-3" />
                    <span>{author?.name || 'Anonymous'}</span>
                    {author?.email && (
                      <span className="text-xs">({author.email})</span>
                    )}
                  </div>

                  {/* Post Info */}
                  {post && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <FileText className="w-3 h-3" />
                      <Link href={`/posts/${post.slug}`} className="hover:underline truncate">
                        {post.title}
                      </Link>
                    </div>
                  )}

                  {/* Date */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleApprove(comment.id)}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      title="Archive comment"
                      aria-label="Archive comment"
                      disabled={isArchiving}
                      onClick={() => handleArchive(comment.id)}
                    >
                      <Archive className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex-1"
                      onClick={() => handleReject(comment.id)}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
      
      {/* Pagination */}
      {filteredComments.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <PaginationControls
              currentPage={pendingComments.page || 1}
              totalPages={pendingComments.totalPages}
              totalDocs={pendingComments.totalDocs}
              limit={pendingComments.limit || 20}
              hasPrevPage={pendingComments.hasPrevPage || false}
              hasNextPage={pendingComments.hasNextPage || false}
              showingCount={filteredComments.length}
            />
          </CardContent>
        </Card>
      )}
      
      {/* Reject Confirmation Dialog */}
      <AlertDialog 
        open={rejectDialog.open} 
        onOpenChange={(open) => setRejectDialog({ ...rejectDialog, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Comments?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject {rejectDialog.commentIds.length} comment(s)? 
              This will permanently delete them from the database. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRejecting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                confirmReject()
              }}
              disabled={isRejecting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isRejecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject Comments
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
