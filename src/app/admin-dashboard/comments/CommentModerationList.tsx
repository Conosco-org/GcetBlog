'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle, XCircle, Trash, AlertTriangle, Eye } from 'lucide-react'
import { moderateComment } from '@/app/(frontend)/posts/[slug]/actions'
import type { Comment } from '@/payload-types'

interface AdminCommentModerationListProps {
  comments: Comment[]
}

function AdminCommentCard({ comment }: { comment: Comment }) {
  const router = useRouter()
  const [isModerating, setIsModerating] = useState(false)
  const [showModerationForm, setShowModerationForm] = useState(false)
  const [showFullComment, setShowFullComment] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleModeration = async (formData: FormData) => {
    setIsModerating(true)
    const result = await moderateComment(formData)

    if (result.error) {
      setMessage({ type: 'error', text: result.error })
    } else {
      setMessage({ type: 'success', text: result.success || 'Comment moderated successfully' })
      setTimeout(() => router.refresh(), 1000)
    }
    setIsModerating(false)
  }

  const getStatusBadge = () => {
    switch (comment.status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-600 text-white">Approved</Badge>
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">Pending</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      case 'spam':
        return <Badge variant="destructive" className="bg-orange-600">Spam</Badge>
      default:
        return null
    }
  }

  const isReported = comment.reportedBy
  const isLongComment = comment.content.length > 300

  return (
    <Card className="mb-4 border-l-4 border-l-yellow-400">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium">{comment.authorName}</h4>
              <span className="text-sm text-muted-foreground">({comment.authorEmail})</span>
              {getStatusBadge()}
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Posted {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</p>
              {comment.post && typeof comment.post === 'object' && (
                <p>On post: <span className="font-medium">{comment.post.title}</span></p>
              )}
              {isReported && (
                <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span>
                    Reported: {comment.reportReason}
                    {comment.reportedAt && (
                      <span className="ml-1">
                        ({formatDistanceToNow(new Date(comment.reportedAt), { addSuffix: true })})
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {isLongComment && (
              <Button variant="ghost" size="sm" onClick={() => setShowFullComment(!showFullComment)} aria-label="Toggle full comment">
                <Eye className="w-4 h-4" />
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => setShowModerationForm(!showModerationForm)}>
              Moderate
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        <div className="bg-muted p-3 rounded-md">
          <p className="whitespace-pre-wrap">
            {isLongComment && !showFullComment
              ? comment.content.substring(0, 300) + '...'
              : comment.content}
          </p>
        </div>

        {message && (
          <div className={`mt-3 p-3 rounded-md text-sm ${
            message.type === 'success'
              ? 'bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20'
              : 'bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20'
          }`}>
            {message.text}
          </div>
        )}
      </CardContent>

      {showModerationForm && (
        <CardFooter className="bg-muted/50 border-t pt-4">
          <form action={handleModeration} className="w-full space-y-4">
            <input type="hidden" name="commentId" value={comment.id} />

            <div className="space-y-2">
              <label className="text-sm font-medium">Moderation Notes (optional)</label>
              <Textarea name="moderationNotes" placeholder="Add notes about your decision..." rows={2} />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="submit" name="action" value="approve" size="sm" disabled={isModerating}
                className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="w-4 h-4 mr-1" /> Approve
              </Button>
              <Button type="submit" name="action" value="reject" variant="destructive" size="sm" disabled={isModerating}>
                <XCircle className="w-4 h-4 mr-1" /> Reject
              </Button>
              <Button type="submit" name="action" value="spam" variant="outline" size="sm" disabled={isModerating}
                className="border-orange-300 text-orange-700 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-400 dark:hover:bg-orange-900/20">
                <Trash className="w-4 h-4 mr-1" /> Mark as Spam
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowModerationForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </CardFooter>
      )}
    </Card>
  )
}

export function AdminCommentModerationList({ comments }: AdminCommentModerationListProps) {
  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground bg-muted rounded-md">
        No comments to moderate
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <AdminCommentCard key={comment.id} comment={comment} />
      ))}
    </div>
  )
}
