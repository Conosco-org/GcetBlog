'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { submitComment } from '@/app/(frontend)/posts/[slug]/actions'

interface CommentFormProps {
  postId: string
}

export function CommentForm({ postId }: CommentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    setMessage(null)

    const result = await submitComment(formData)

    if (result.error) {
      setMessage({ type: 'error', text: result.error })
    } else {
      setMessage({ type: 'success', text: result.success || 'Comment submitted successfully!' })
      // Reset form
      const form = document.getElementById('comment-form') as HTMLFormElement
      if (form) form.reset()
    }

    setIsSubmitting(false)
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Leave a Comment</CardTitle>
        <CardDescription>Your comment will be reviewed before being published.</CardDescription>
      </CardHeader>
      <form id="comment-form" action={handleSubmit}>
        <CardContent className="space-y-4">
          <input type="hidden" name="postId" value={postId} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="authorName">Name *</Label>
              <Input
                id="authorName"
                name="authorName"
                required
                placeholder="Your name"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="authorEmail">Email *</Label>
              <Input
                id="authorEmail"
                name="authorEmail"
                type="email"
                required
                placeholder="Your email (not displayed publicly)"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Comment *</Label>
            <Textarea
              id="content"
              name="content"
              required
              placeholder="Write your comment here..."
              rows={4}
              disabled={isSubmitting}
            />
          </div>

          {message && (
            <div
              className={`p-3 rounded-md ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message.text}
            </div>
          )}
        </CardContent>

        <CardFooter>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Comment'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
