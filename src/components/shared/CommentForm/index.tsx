'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { submitComment } from '@/app/(frontend)/posts/[slug]/actions'

interface CommentFormProps {
  postId: string
  user?: { id: string; name: string; email: string } | null
}

export function CommentForm({ postId, user }: CommentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    setMessage(null)

    const result = await submitComment(formData)

    if (result.error) {
      setMessage({ type: 'error', text: result.error })
    } else {
      setMessage({ type: 'success', text: result.success || 'Comment submitted for review!' })
      formRef.current?.reset()
    }

    setIsSubmitting(false)
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div>
        <h3 className="text-base font-semibold">Leave a comment</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Your comment will be reviewed before being published.</p>
      </div>

      {!user ? (
        <div className="p-4 bg-muted rounded-md">
          <p className="text-sm text-muted-foreground mb-2">
            You must be logged in to comment
          </p>
          <Button asChild>
            <Link href="/login">Log In</Link>
          </Button>
        </div>
      ) : (
        <form ref={formRef} action={handleSubmit} className="space-y-3">
          <input type="hidden" name="postId" value={postId} />

          <p className="text-sm text-muted-foreground">
            Commenting as <span className="font-medium text-foreground">{user.name}</span>
          </p>

          <Textarea
            name="content"
            required
            placeholder="Write your comment…"
            rows={4}
            disabled={isSubmitting}
            className="resize-none"
          />

          {message && (
            <p
              className={`text-sm rounded-md px-3 py-2 ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400'
                  : 'bg-destructive/10 text-destructive'
              }`}
            >
              {message.text}
            </p>
          )}

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting…' : 'Submit Comment'}
          </Button>
        </form>
      )}
    </div>
  )
}

