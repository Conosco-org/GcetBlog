'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'

interface RejectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (reason: string, customReason?: string) => Promise<void>
  commentCount: number
}

export function RejectDialog({ open, onOpenChange, onConfirm, commentCount }: RejectDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [reason, setReason] = useState('')
  const [customReason, setCustomReason] = useState('')

  const handleConfirm = async () => {
    if (!reason) return

    setIsLoading(true)
    try {
      await onConfirm(reason, customReason)
      setReason('')
      setCustomReason('')
      onOpenChange(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Comments</DialogTitle>
          <DialogDescription>
            Select a reason for rejecting {commentCount} comment(s)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="rejection-reason">Rejection Reason</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger id="rejection-reason">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="violates guidelines">Violates Guidelines</SelectItem>
                <SelectItem value="spam">Spam</SelectItem>
                <SelectItem value="off-topic">Off-Topic</SelectItem>
                <SelectItem value="inappropriate language">Inappropriate Language</SelectItem>
                <SelectItem value="duplicate">Duplicate</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {reason === 'other' && (
            <div className="space-y-2">
              <Label htmlFor="custom-reason">Custom Reason</Label>
              <Textarea
                id="custom-reason"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Enter custom rejection reason..."
                rows={3}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isLoading || !reason}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Rejecting...
              </>
            ) : (
              'Reject'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface SpamDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (spamType: string) => Promise<void>
  commentCount: number
}

export function SpamDialog({ open, onOpenChange, onConfirm, commentCount }: SpamDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [spamType, setSpamType] = useState('')

  const handleConfirm = async () => {
    if (!spamType) return

    setIsLoading(true)
    try {
      await onConfirm(spamType)
      setSpamType('')
      onOpenChange(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark as Spam</DialogTitle>
          <DialogDescription>
            Select spam type for {commentCount} comment(s)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="spam-type">Spam Type</Label>
            <Select value={spamType} onValueChange={setSpamType}>
              <SelectTrigger id="spam-type">
                <SelectValue placeholder="Select spam type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="malicious">Malicious</SelectItem>
                <SelectItem value="off-topic">Off-Topic</SelectItem>
                <SelectItem value="abusive">Abusive</SelectItem>
                <SelectItem value="bot-generated">Bot-Generated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            className="bg-orange-600 hover:bg-orange-700"
            onClick={handleConfirm}
            disabled={isLoading || !spamType}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Marking...
              </>
            ) : (
              'Mark as Spam'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface DeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void>
  commentCount: number
}

export function DeleteDialog({ open, onOpenChange, onConfirm, commentCount }: DeleteDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Comments</DialogTitle>
          <DialogDescription>
            Are you sure you want to permanently delete {commentCount} comment(s)? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Permanently'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
