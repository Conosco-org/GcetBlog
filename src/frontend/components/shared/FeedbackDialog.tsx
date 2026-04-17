'use client'

import { useState } from 'react'
import { Button } from '@/frontend/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/frontend/components/ui/dialog'
import { Textarea } from '@/frontend/components/ui/textarea'
import { Label } from '@/frontend/components/ui/label'
import { Loader2 } from 'lucide-react'

interface FeedbackDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (feedback: string) => Promise<void>
  postTitle: string
}

export function FeedbackDialog({ open, onOpenChange, onConfirm, postTitle }: FeedbackDialogProps) {
  const [feedback, setFeedback] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      return
    }

    setIsLoading(true)
    try {
      await onConfirm(feedback)
      setFeedback('')
      onOpenChange(false)
    } catch (error) {
      console.error('Error submitting feedback:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setFeedback('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send Feedback</DialogTitle>
          <DialogDescription>
            Provide feedback for &ldquo;{postTitle}&rdquo;. This will be sent to the contributor.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="feedback">Feedback Message</Label>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="What changes are needed for this post?"
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Be specific and constructive in your feedback.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!feedback.trim() || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              'Send Feedback'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
