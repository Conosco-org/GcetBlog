'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, Eye } from 'lucide-react'
import { approvePost, rejectPost } from './actions'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
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
  const [isRejecting, setIsRejecting] = useState(false)

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
    } catch (_error) {
      toast({
        title: "Error",
        description: "An error occurred while approving the post",
        variant: "destructive",
      })
      setIsApproving(false)
    }
  }

  const handleReject = async () => {
    const reason = prompt(`Why are you rejecting "${postTitle}"? (This feedback will be sent to the author)`)
    if (reason === null) {
      return // User cancelled
    }

    setIsRejecting(true)
    try {
      const result = await rejectPost(postId, reason || undefined)
      if (result.success) {
        toast({
          title: "Post Rejected",
          description: "Feedback sent to the author",
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
    } catch (_error) {
      toast({
        title: "Error",
        description: "An error occurred while rejecting the post",
        variant: "destructive",
      })
      setIsRejecting(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        asChild
        size="sm"
        variant="outline"
        title="Preview"
        aria-label="Preview"
      >
        <Link href={`/api/draft?slug=${postSlug}`} target="_blank">
          <Eye className="w-4 h-4 sm:mr-1" />
          <span className="hidden sm:inline">Preview</span>
        </Link>
      </Button>
      <Button
        onClick={handleApprove}
        disabled={isApproving || isRejecting}
        size="sm"
        className="bg-green-600 hover:bg-green-700"
        title="Approve"
        aria-label="Approve"
      >
        <CheckCircle className="w-4 h-4 sm:mr-1" />
        <span className="hidden sm:inline">{isApproving ? 'Approving...' : 'Approve'}</span>
      </Button>
      <Button
        onClick={handleReject}
        disabled={isApproving || isRejecting}
        size="sm"
        variant="destructive"
        title="Reject"
        aria-label="Reject"
      >
        <XCircle className="w-4 h-4 sm:mr-1" />
        <span className="hidden sm:inline">{isRejecting ? 'Rejecting...' : 'Reject'}</span>
      </Button>
    </div>
  )
}
