'use client'

import { useState } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'
import { approvePost, rejectPost } from './actions'
import { useRouter } from 'next/navigation'

interface ApprovalButtonsProps {
  postId: string
  postTitle: string
}

export function ApprovalButtons({ postId, postTitle }: ApprovalButtonsProps) {
  const router = useRouter()
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)

  const handleApprove = async () => {
    if (!confirm(`Are you sure you want to approve "${postTitle}"?`)) {
      return
    }

    setIsApproving(true)
    try {
      const result = await approvePost(postId)
      if (result.success) {
        alert('Post approved and published successfully!')
        router.refresh()
      } else {
        alert(result.message || 'Failed to approve post')
      }
    } catch (error) {
      alert('An error occurred while approving the post')
    } finally {
      setIsApproving(false)
    }
  }

  const handleReject = async () => {
    const reason = prompt(`Why are you rejecting "${postTitle}"? (This will be sent to the author)`)
    if (reason === null) {
      return // User cancelled
    }

    setIsRejecting(true)
    try {
      const result = await rejectPost(postId, reason || undefined)
      if (result.success) {
        alert('Post rejected with feedback sent to author')
        router.refresh()
      } else {
        alert(result.message || 'Failed to reject post')
      }
    } catch (error) {
      alert('An error occurred while rejecting the post')
    } finally {
      setIsRejecting(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleApprove}
        disabled={isApproving || isRejecting}
        className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm font-medium flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <CheckCircle className="w-4 h-4" />
        {isApproving ? 'Approving...' : 'Approve'}
      </button>
      <button
        onClick={handleReject}
        disabled={isApproving || isRejecting}
        className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm font-medium flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <XCircle className="w-4 h-4" />
        {isRejecting ? 'Rejecting...' : 'Reject'}
      </button>
    </div>
  )
}
