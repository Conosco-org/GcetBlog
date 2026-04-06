'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { CommentCard } from '@/components/shared/comments/CommentCard'
import { BulkActionBar } from '@/components/shared/comments/BulkActionBar'
import { RejectDialog, SpamDialog, DeleteDialog } from '@/components/shared/comments/ModerationDialogs'
import { approveComments, rejectComments, markAsSpam, deleteComments } from '@/lib/comments/actions'
import type { Comment } from '@/payload-types'

interface CommentModerationViewProps {
  pendingComments: Comment[]
}

export function CommentModerationView({
  pendingComments,
}: CommentModerationViewProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedComments, setSelectedComments] = useState<string[]>([])
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [showSpamDialog, setShowSpamDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [currentCommentId, setCurrentCommentId] = useState<string | null>(null)

  const handleSelect = (commentId: string, selected: boolean) => {
    setSelectedComments((prev) =>
      selected ? [...prev, commentId] : prev.filter((id) => id !== commentId)
    )
  }

  const handleSelectAll = (selected: boolean) => {
    setSelectedComments(selected ? pendingComments.map((c) => c.id) : [])
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

  const handleRejectClick = (commentId?: string) => {
    setCurrentCommentId(commentId || null)
    setShowRejectDialog(true)
  }

  const handleRejectConfirm = async (reason: string, customReason?: string) => {
    const ids = currentCommentId ? [currentCommentId] : selectedComments
    const result = await rejectComments(ids, reason, customReason)

    if (result.success) {
      toast({ title: 'Success', description: result.message })
      setSelectedComments([])
      setCurrentCommentId(null)
      router.refresh()
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
    }
  }

  const handleSpamClick = (commentId?: string) => {
    setCurrentCommentId(commentId || null)
    setShowSpamDialog(true)
  }

  const handleSpamConfirm = async (spamType: string) => {
    const ids = currentCommentId ? [currentCommentId] : selectedComments
    const result = await markAsSpam(ids, spamType)

    if (result.success) {
      toast({ title: 'Success', description: result.message })
      setSelectedComments([])
      setCurrentCommentId(null)
      router.refresh()
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
    }
  }

  const handleDeleteClick = () => {
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    const result = await deleteComments(selectedComments)

    if (result.success) {
      toast({ title: 'Success', description: result.message })
      setSelectedComments([])
      router.refresh()
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
    }
  }

  const allSelected = pendingComments.length > 0 && selectedComments.length === pendingComments.length

  return (
    <div>
      <BulkActionBar
        selectedCount={selectedComments.length}
        onApprove={() => handleApprove()}
        onReject={() => handleRejectClick()}
        onSpam={() => handleSpamClick()}
        onDelete={handleDeleteClick}
        onClear={() => setSelectedComments([])}
      />

      <div className="mb-4 flex items-center gap-2 p-3 bg-muted rounded">
        <Checkbox checked={allSelected} onCheckedChange={handleSelectAll} />
        <span className="text-sm font-medium">
          Select all ({pendingComments.length} comments)
        </span>
      </div>

      {pendingComments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground bg-muted rounded-md">
          No pending comments
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {pendingComments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              isSelected={selectedComments.includes(comment.id)}
              onSelect={handleSelect}
              onApprove={handleApprove}
              onReject={handleRejectClick}
              onSpam={handleSpamClick}
            />
          ))}
        </div>
      )}

      <RejectDialog
        open={showRejectDialog}
        onOpenChange={setShowRejectDialog}
        onConfirm={handleRejectConfirm}
        commentCount={currentCommentId ? 1 : selectedComments.length}
      />

      <SpamDialog
        open={showSpamDialog}
        onOpenChange={setShowSpamDialog}
        onConfirm={handleSpamConfirm}
        commentCount={currentCommentId ? 1 : selectedComments.length}
      />

      <DeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteConfirm}
        commentCount={selectedComments.length}
      />
    </div>
  )
}
