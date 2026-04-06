'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { MessageCircle, Flag, ChevronDown, ChevronUp, CheckCircle, XCircle, Trash, AlertTriangle } from 'lucide-react'
import { submitComment, reportComment, moderateComment } from '@/app/(frontend)/posts/[slug]/actions'
import type { Comment, User } from '@/payload-types'

interface CommentListProps {
  comments: Comment[]
  postId: string
  currentUser?: User | null
}

// ─── Inline reply form ────────────────────────────────────────────────────────

interface ReplyFormProps {
  postId: string
  parentId: string
  onCancel: () => void
  currentUser?: { id: string; name: string; email: string } | null
}

function ReplyForm({ postId, parentId, onCancel, currentUser }: ReplyFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    setMsg(null)
    const result = await submitComment(formData)
    if (result.error) {
      setMsg(result.error)
      setIsSubmitting(false)
    } else {
      setSuccess(true)
      setMsg(result.success || 'Reply submitted for review!')
      setTimeout(onCancel, 1600)
    }
  }

  // Require authentication for replies
  if (!currentUser) {
    return (
      <div className="mt-3 pl-4 border-l-2 border-border p-3 bg-muted rounded-md">
        <p className="text-xs text-muted-foreground mb-2">
          You must be logged in to reply
        </p>
        <div className="flex gap-2">
          <Button asChild size="sm" className="h-7 text-xs px-3">
            <Link href="/login">Log In</Link>
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={onCancel} className="h-7 text-xs px-3">
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form action={handleSubmit} className="mt-3 pl-4 border-l-2 border-border space-y-2">
      <input type="hidden" name="postId" value={postId} />
      <input type="hidden" name="parentId" value={parentId} />
      <p className="text-xs text-muted-foreground">
        Replying as <span className="font-medium text-foreground">{currentUser.name}</span>
      </p>
      <Textarea name="content" placeholder="Write a reply…" required disabled={isSubmitting || success} rows={2} className="text-sm resize-none" />
      {msg && (
        <p className={`text-xs ${success ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>{msg}</p>
      )}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isSubmitting || success} className="h-7 text-xs px-3">
          {isSubmitting ? 'Posting…' : 'Post Reply'}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} className="h-7 text-xs px-3">
          Cancel
        </Button>
      </div>
    </form>
  )
}

// ─── Single comment item (recursive for replies) ──────────────────────────────

interface CommentItemProps {
  comment: Comment
  replies: Comment[]
  postId: string
  isEditor: boolean
  depth?: number
  currentUser?: { id: string; name: string; email: string } | null
}

function CommentItem({ comment, replies, postId, isEditor, depth = 0, currentUser }: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [showReplies, setShowReplies] = useState(true)
  const [reporting, setReporting] = useState(false)
  const [reported, setReported] = useState(false)
  const [showModerate, setShowModerate] = useState(false)
  const [isModerating, setIsModerating] = useState(false)
  const [modMsg, setModMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const authorDisplay = comment.authorName || 'Anonymous'
  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })
  const initial = authorDisplay.charAt(0).toUpperCase()

  const handleReport = async () => {
    if (reported) return
    setReporting(true)
    const fd = new FormData()
    fd.append('commentId', String(comment.id))
    fd.append('reason', 'inappropriate')
    await reportComment(fd)
    setReported(true)
    setReporting(false)
  }

  const handleModerate = async (formData: FormData) => {
    setIsModerating(true)
    const result = await moderateComment(formData)
    if (result.error) {
      setModMsg({ type: 'error', text: result.error })
    } else {
      setModMsg({ type: 'success', text: result.success || 'Done' })
      setTimeout(() => setShowModerate(false), 1200)
    }
    setIsModerating(false)
  }

  return (
    <div className={depth > 0 ? 'ml-5 pl-4 border-l border-border/60' : ''}>
      <div className="flex gap-3 group">
        {/* Avatar initial */}
        <div
          className="flex-shrink-0 mt-0.5 w-8 h-8 rounded-full bg-accent/10 dark:bg-accent/20 flex items-center justify-center font-semibold text-sm text-accent select-none"
          aria-hidden="true"
        >
          {initial}
        </div>

        {/* Body */}
        <div className="flex-1 min-w-0 pb-4">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 mb-1">
            <span className="text-sm font-semibold leading-snug">{authorDisplay}</span>
            {/* Status badge - editors only */}
            {isEditor && comment.status !== 'approved' && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-medium leading-none ${
                  comment.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400'
                    : comment.status === 'rejected'
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                      : 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400'
                }`}
              >
                {comment.status}
              </span>
            )}
            <span className="text-xs text-muted-foreground leading-snug">{timeAgo}</span>
          </div>

          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words">
            {comment.content}
          </p>

          {/* Action row - visible on hover */}
          <div className="flex items-center gap-4 mt-1.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
            {depth < 2 && (
              <button
                type="button"
                onClick={() => setShowReplyForm((v) => !v)}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-accent transition-colors"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                Reply
              </button>
            )}
            {!reported ? (
              <button
                type="button"
                onClick={handleReport}
                disabled={reporting}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                aria-label="Report comment"
              >
                <Flag className="h-3.5 w-3.5" />
                {reporting ? 'Reporting…' : 'Report'}
              </button>
            ) : (
              <span className="text-xs text-muted-foreground">Reported</span>
            )}
            {isEditor && comment.status === 'pending' && (
              <button
                type="button"
                onClick={() => setShowModerate((v) => !v)}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                Moderate
              </button>
            )}
          </div>

          {/* Moderation panel (editors only) */}
          {showModerate && isEditor && (
            <form action={handleModerate} className="mt-2 p-3 rounded-lg bg-muted/40 border border-border space-y-2">
              <input type="hidden" name="commentId" value={comment.id} />
              <Textarea name="moderationNotes" placeholder="Moderation notes (optional)" rows={2} className="text-xs resize-none" />
              {modMsg && (
                <p className={`text-xs ${modMsg.type === 'success' ? 'text-green-600' : 'text-destructive'}`}>{modMsg.text}</p>
              )}
              <div className="flex flex-wrap gap-2">
                <Button type="submit" name="action" value="approve" size="sm" disabled={isModerating} className="h-7 text-xs bg-green-600 hover:bg-green-700">
                  <CheckCircle className="h-3 w-3 mr-1" />Approve
                </Button>
                <Button type="submit" name="action" value="reject" variant="destructive" size="sm" disabled={isModerating} className="h-7 text-xs">
                  <XCircle className="h-3 w-3 mr-1" />Reject
                </Button>
                <Button type="submit" name="action" value="spam" variant="outline" size="sm" disabled={isModerating} className="h-7 text-xs border-orange-300 text-orange-700">
                  <Trash className="h-3 w-3 mr-1" />Spam
                </Button>
              </div>
            </form>
          )}

          {/* Inline reply form */}
          {showReplyForm && (
            <ReplyForm postId={postId} parentId={String(comment.id)} onCancel={() => setShowReplyForm(false)} currentUser={currentUser} />
          )}

          {/* Replies toggle + list */}
          {replies.length > 0 && (
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setShowReplies((v) => !v)}
                className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent/70 transition-colors mb-2"
              >
                {showReplies ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
              </button>
              {showReplies && (
                <div className="space-y-3">
                  {replies.map((reply) => (
                    <CommentItem
                      key={reply.id}
                      comment={reply}
                      replies={[]}
                      postId={postId}
                      isEditor={isEditor}
                      depth={depth + 1}
                      currentUser={currentUser}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Public list ──────────────────────────────────────────────────────────────

export function CommentList({ comments, postId, currentUser }: CommentListProps) {
  const isEditor = currentUser?.role === 'editor'

  // Editors see all; public sees only approved
  const visible = isEditor ? comments : comments.filter((c) => c.status === 'approved')

  // Split top-level vs replies
  const topLevel = visible.filter((c) => !c.parent)
  const repliesMap: Record<string, Comment[]> = {}
  visible
    .filter((c) => !!c.parent)
    .forEach((c) => {
      const pid = typeof c.parent === 'object' && c.parent !== null ? String((c.parent as Comment).id) : String(c.parent)
      ;(repliesMap[pid] ??= []).push(c)
    })

  if (topLevel.length === 0) {
    return (
      <p className="text-center py-8 text-sm text-muted-foreground">
        No comments yet - be the first to share your thoughts!
      </p>
    )
  }

  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-muted-foreground mb-4">
        {topLevel.length} {topLevel.length === 1 ? 'comment' : 'comments'}
      </p>
      {topLevel.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          replies={repliesMap[String(comment.id)] ?? []}
          postId={postId}
          isEditor={!!isEditor}
          depth={0}
          currentUser={currentUser}
        />
      ))}
    </div>
  )
}
