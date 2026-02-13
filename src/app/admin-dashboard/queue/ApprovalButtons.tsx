'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, Eye } from 'lucide-react'
import { approvePost, rejectPost } from '@/app/(frontend)/editor/queue/actions'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

interface AdminQueueApprovalButtonsProps {
  postId: string
  postTitle: string
  postSlug: string
}

export function AdminQueueApprovalButtons({ postId, postTitle, postSlug }: AdminQueueApprovalButtonsProps) {
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
          title: 'Success!',
          description: 'Post approved and published successfully!',
        })
        setTimeout(() => router.refresh(), 500)
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to approve post',
          variant: 'destructive',
        })
        setIsApproving(false)
      }
    } catch (_error) {
      toast({
        title: 'Error',
        description: 'An error occurred while approving the post',
        variant: 'destructive',
      })
      setIsApproving(false)
    }
  }

  const handleReject = async () => {
    const reason = prompt(`Why are you rejecting "${postTitle}"? (This feedback will be sent to the author)`)
    if (reason === null) return

    setIsRejecting(true)
    try {
      const result = await rejectPost(postId, reason || undefined)
      if (result.success) {
        toast({
          title: 'Post Rejected',
          description: 'Feedback sent to the author',
        })
        setTimeout(() => router.refresh(), 500)
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to reject post',
          variant: 'destructive',
        })
        setIsRejecting(false)
      }
    } catch (_error) {
      toast({
        title: 'Error',
        description: 'An error occurred while rejecting the post',
        variant: 'destructive',
      })
      setIsRejecting(false)
    }
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        onClick={handleApprove}
        disabled={isApproving || isRejecting}
        variant="ghost"
        size="sm"
        className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
      >
        <CheckCircle className="w-4 h-4 mr-1" />
        {isApproving ? 'Approving...' : 'Approve'}
      </Button>
      <Button
        onClick={handleReject}
        disabled={isApproving || isRejecting}
        variant="ghost"
        size="sm"
        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
      >
        <XCircle className="w-4 h-4 mr-1" />
        {isRejecting ? 'Rejecting...' : 'Reject'}
      </Button>
      {postSlug && (
        <Button variant="ghost" size="sm" asChild aria-label="Preview post">
          <Link href={`/posts/${postSlug}?draft=true`} target="_blank">
            <Eye className="w-4 h-4" />
          </Link>
        </Button>
      )}
    </div>
  )
}
