'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { AlertTriangle, Flag, CheckCircle, XCircle, Trash } from 'lucide-react'
import { moderateComment, reportComment } from '@/app/(frontend)/posts/[slug]/actions'
import type { Comment, User } from '@/payload-types'

interface CommentListProps {
  comments: Comment[]
  currentUser?: User | null
}

interface CommentCardProps {
  comment: Comment
  currentUser?: User | null
}

function CommentCard({ comment, currentUser }: CommentCardProps) {
  const [isReporting, setIsReporting] = useState(false)
  const [isModerating, setIsModerating] = useState(false)
  const [showModerationForm, setShowModerationForm] = useState(false)
  const [showReportForm, setShowReportForm] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const isStaff = currentUser && currentUser.role === 'editor'
  const canModerate = isStaff && comment.status === 'pending'

  const handleReport = async (formData: FormData) => {
    setIsReporting(true)
    const result = await reportComment(formData)

    if (result.error) {
      setMessage({ type: 'error', text: result.error })
    } else {
      setMessage({ type: 'success', text: result.success || 'Comment reported successfully' })
      setShowReportForm(false)
    }
    setIsReporting(false)
  }

  const handleModeration = async (formData: FormData) => {
    setIsModerating(true)
    const result = await moderateComment(formData)

    if (result.error) {
      setMessage({ type: 'error', text: result.error })
    } else {
      setMessage({ type: 'success', text: result.success || 'Comment moderated successfully' })
      setShowModerationForm(false)
    }
    setIsModerating(false)
  }

  const getStatusBadge = () => {
    switch (comment.status) {
      case 'approved':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Approved
          </Badge>
        )
      case 'pending':
        return <Badge variant="secondary">Pending Review</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      case 'spam':
        return (
          <Badge variant="destructive" className="bg-orange-100 text-orange-800">
            Spam
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <Card
      className={`mb-4 ${comment.status === 'pending' ? 'border-yellow-200 bg-yellow-50' : ''}`}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-medium">{comment.authorName}</h4>
              {getStatusBadge()}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </p>
          </div>

          <div className="flex gap-2">
            {currentUser && !isStaff && (
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500"
                onClick={() => setShowReportForm(!showReportForm)}
              >
                <Flag className="w-4 h-4" />
              </Button>
            )}

            {canModerate && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowModerationForm(!showModerationForm)}
              >
                <AlertTriangle className="w-4 h-4 mr-1" />
                Moderate
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <p className="whitespace-pre-wrap">{comment.content}</p>

        {showReportForm && (
          <div className="mt-4 p-4 border rounded-md bg-gray-50">
            <h4 className="font-medium mb-2">Report Comment</h4>
            <form action={handleReport} className="space-y-3">
              <input type="hidden" name="commentId" value={comment.id} />
              <div>
                <select name="reason" required className="w-full p-2 border rounded-md" aria-label="Report reason">
                  <option value="">Select a reason</option>
                  <option value="spam">Spam</option>
                  <option value="inappropriate">Inappropriate content</option>
                  <option value="harassment">Harassment</option>
                  <option value="misinformation">Misinformation</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={isReporting}>
                  {isReporting ? 'Reporting...' : 'Report'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReportForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {message && (
          <div
            className={`mt-3 p-3 rounded-md ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}
      </CardContent>

      {showModerationForm && canModerate && (
        <CardFooter className="bg-gray-50 border-t">
          <form action={handleModeration} className="w-full space-y-4">
            <input type="hidden" name="commentId" value={comment.id} />

            <div className="space-y-2">
              <label className="text-sm font-medium">Moderation Notes (optional)</label>
              <Textarea
                name="moderationNotes"
                placeholder="Add notes about your decision..."
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                name="action"
                value="approve"
                variant="default"
                size="sm"
                disabled={isModerating}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Approve
              </Button>
              <Button
                type="submit"
                name="action"
                value="reject"
                variant="destructive"
                size="sm"
                disabled={isModerating}
              >
                <XCircle className="w-4 h-4 mr-1" />
                Reject
              </Button>
              <Button
                type="submit"
                name="action"
                value="spam"
                variant="outline"
                size="sm"
                disabled={isModerating}
                className="border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                <Trash className="w-4 h-4 mr-1" />
                Mark as Spam
              </Button>
            </div>
          </form>
        </CardFooter>
      )}
    </Card>
  )
}

export function CommentList({ comments, currentUser }: CommentListProps) {
  // Filter comments based on user role
  const visibleComments = comments.filter((comment) => {
    // Staff can see all comments
    if (currentUser && currentUser.role === 'editor') {
      return true
    }
    // Regular users only see approved comments
    return comment.status === 'approved'
  })

  if (visibleComments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No comments yet. Be the first to comment!
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold mb-4">Comments ({visibleComments.length})</h3>

      {visibleComments.map((comment) => (
        <CommentCard key={comment.id} comment={comment} currentUser={currentUser} />
      ))}
    </div>
  )
}
