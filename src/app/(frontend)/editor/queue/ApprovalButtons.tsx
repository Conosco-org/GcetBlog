'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, Eye, Edit, MessageSquare } from 'lucide-react'
import { approvePost, requestChanges, deletePost } from './actions'
import { useRouter } from 'next/navigation'
import { Button } from '@frontend/components/ui/button'
import { useToast } from '@frontend/components/ui/use-toast'
import { FeedbackDialog } from '@/frontend/components/shared/FeedbackDialog'
import { RejectDialog } from '@/frontend/components/shared/RejectDialog'
import Link from 'next/link'

interface ApprovalButtonsProps {
  postId: string
  postTitle: string
  postSlug: string
}

export function ApprovalButtons({ postId, postTitle, postSlug }: ApprovalButtonsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isApproving, setIsApproving] = useState(false)
  const [isRequestingChanges, setIsRequestingChanges] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)

  const handleApprove = async () => {
    if (!confirm(`Are you sure you want to approve and publish "${postTitle}"?`)) {
      return
    }

    setIsApproving(true)
    try {
      const result = await approvePost(postId)
      if (result.success) {
        toast({
          title: "Success!",
          description: "Post approved and published successfully!",
        })
        // Wait a moment for the database to update, then refresh
        setTimeout(() => {
          router.refresh()
        }, 500)
      } else {
        toast({
          title: "Error",
          description: result.message || 'Failed to approve post',
          variant: "destructive",
        })
        setIsApproving(false)
      }
    } catch {
      toast({
        title: "Error",
        description: "An error occurred while approving the post",
        variant: "destructive",
      })
      setIsApproving(false)
    }
  }

  const handleRequestChanges = async (feedback: string) => {
    setIsRequestingChanges(true)
    
    try {
      const result = await requestChanges(postId, feedback)
      
      if (result.success) {
        toast({
          title: "Changes Requested",
          description: "Feedback sent to contributor. Post removed from queue.",
        })
        // Wait a moment for the database to update, then refresh
        setTimeout(() => {
          router.refresh()
        }, 500)
      } else {
        toast({
          title: "Error",
          description: result.message || 'Failed to request changes',
          variant: "destructive",
        })
        setIsRequestingChanges(false)
      }
    } catch (error) {
      console.error('Error requesting changes:', error)
      toast({
        title: "Error",
        description: "An error occurred while requesting changes",
        variant: "destructive",
      })
      setIsRequestingChanges(false)
    }
  }

  const handleReject = async (reason: string) => {
    setIsRejecting(true)
    try {
      const result = await deletePost(postId, reason)
      if (result.success) {
        toast({
          title: "Post Rejected",
          description: "Post permanently rejected and removed from database",
        })
        // Wait a moment for the database to update, then refresh
        setTimeout(() => {
          router.refresh()
        }, 500)
      } else {
        toast({
          title: "Error",
          description: result.message || 'Failed to reject post',
          variant: "destructive",
        })
        setIsRejecting(false)
      }
    } catch {
      toast({
        title: "Error",
        description: "An error occurred while rejecting the post",
        variant: "destructive",
      })
      setIsRejecting(false)
    }
  }

  const isProcessing = isApproving || isRequestingChanges || isRejecting

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          asChild
          size="sm"
          variant="outline"
          title="Preview"
          aria-label="Preview"
          disabled={isProcessing}
        >
          <Link href={`/api/draft?slug=${postSlug}`} target="_blank">
            <Eye className="w-4 h-4 sm:mr-1" />
            <span className="hidden sm:inline">Preview</span>
          </Link>
        </Button>
        <Button
          asChild
          size="sm"
          variant="outline"
          title="Edit"
          aria-label="Edit"
          disabled={isProcessing}
        >
          <Link href={`/editor/posts/${postId}/edit`}>
            <Edit className="w-4 h-4 sm:mr-1" />
            <span className="hidden sm:inline">Edit</span>
          </Link>
        </Button>
        <Button
          onClick={handleApprove}
          disabled={isProcessing}
          size="sm"
          className="bg-green-600 hover:bg-green-700"
          title="Approve and Publish"
          aria-label="Approve"
        >
          <CheckCircle className="w-4 h-4 sm:mr-1" />
          <span className="hidden sm:inline">{isApproving ? 'Approving...' : 'Approve'}</span>
        </Button>
        <Button
          onClick={() => setFeedbackDialogOpen(true)}
          disabled={isProcessing}
          size="sm"
          variant="outline"
          className="border-orange-300 text-orange-700 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-400 dark:hover:bg-orange-950"
          title="Request Changes"
          aria-label="Request Changes"
        >
          <MessageSquare className="w-4 h-4 sm:mr-1" />
          <span className="hidden sm:inline">{isRequestingChanges ? 'Sending...' : 'Feedback'}</span>
        </Button>
        <Button
          onClick={() => setRejectDialogOpen(true)}
          disabled={isProcessing}
          size="sm"
          variant="destructive"
          title="Reject and Delete Post Permanently"
          aria-label="Reject"
        >
          <XCircle className="w-4 h-4 sm:mr-1" />
          <span className="hidden sm:inline">{isRejecting ? 'Rejecting...' : 'Reject'}</span>
        </Button>
      </div>

      {/* Feedback Dialog */}
      <FeedbackDialog
        open={feedbackDialogOpen}
        onOpenChange={setFeedbackDialogOpen}
        onConfirm={handleRequestChanges}
        postTitle={postTitle}
      />

      {/* Reject Dialog */}
      <RejectDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        onConfirm={handleReject}
        postTitle={postTitle}
        isPermanent={true}
      />
    </>
  )
}
