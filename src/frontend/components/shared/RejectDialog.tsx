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
import { Loader2, AlertTriangle } from 'lucide-react'

interface RejectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (reason: string) => Promise<void>
  postTitle: string
  isPermanent?: boolean
}

export function RejectDialog({ 
  open, 
  onOpenChange, 
  onConfirm, 
  postTitle,
  isPermanent = false 
}: RejectDialogProps) {
  const [reason, setReason] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (!reason.trim()) {
      return
    }

    setIsLoading(true)
    try {
      await onConfirm(reason)
      setReason('')
      onOpenChange(false)
    } catch (error) {
      console.error('Error rejecting:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setReason('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            {isPermanent ? 'Reject and Delete Post' : 'Reject Post'}
          </DialogTitle>
          <DialogDescription>
            {isPermanent ? (
              <>
                <span className="block mb-2 text-destructive font-medium">
                  ⚠️ WARNING: This will PERMANENTLY DELETE &ldquo;{postTitle}&rdquo; from the database.
                </span>
                <span className="block">
                  The contributor will be notified with your reason. This action cannot be undone.
                </span>
              </>
            ) : (
              <>
                Provide a reason for rejecting &ldquo;{postTitle}&rdquo;. The contributor will be notified.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Rejection Reason</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why are you rejecting this post?"
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {isPermanent 
                ? 'This reason will be saved in the audit log and the contributor will know their post was rejected.'
                : 'Be specific about what needs to be improved.'
              }
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
            variant="destructive"
            onClick={handleSubmit}
            disabled={!reason.trim() || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Rejecting...
              </>
            ) : (
              isPermanent ? 'Reject & Delete' : 'Reject Post'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
