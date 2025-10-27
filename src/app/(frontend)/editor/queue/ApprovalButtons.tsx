'use client'

import { useState } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'
import { approvePost, rejectPost } from './actions'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

interface ApprovalButtonsProps {
  postId: string
  postTitle: string
}

export function ApprovalButtons({ postId, postTitle }: ApprovalButtonsProps) {
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
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: result.message || 'Failed to approve post',
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while approving the post",
        variant: "destructive",
      })
    } finally {
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
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: result.message || 'Failed to reject post',
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while rejecting the post",
        variant: "destructive",
      })
    } finally {
      setIsRejecting(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={handleApprove}
        disabled={isApproving || isRejecting}
        size="sm"
        className="bg-green-600 hover:bg-green-700"
      >
        <CheckCircle className="w-4 h-4 mr-1" />
        {isApproving ? 'Approving...' : 'Approve'}
      </Button>
      <Button
        onClick={handleReject}
        disabled={isApproving || isRejecting}
        size="sm"
        variant="destructive"
      >
        <XCircle className="w-4 h-4 mr-1" />
        {isRejecting ? 'Rejecting...' : 'Reject'}
      </Button>
    </div>
  )
}
