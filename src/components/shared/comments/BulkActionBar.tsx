'use client'

import { Button } from '@/components/ui/button'

interface BulkActionBarProps {
  selectedCount: number
  onApprove: () => void
  onReject: () => void
  onSpam: () => void
  onDelete: () => void
  onClear: () => void
}

export function BulkActionBar({
  selectedCount,
  onApprove,
  onReject,
  onSpam,
  onDelete,
  onClear,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null

  return (
    <div className="mb-4 p-4 border rounded-lg bg-background">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-medium">{selectedCount} comment(s) selected</span>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onApprove}
            className="h-9"
          >
            Approve
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={onReject}
            className="h-9"
          >
            Reject
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={onSpam}
            className="h-9"
          >
            Mark as Spam
          </Button>

          <Button
            size="sm"
            variant="destructive"
            onClick={onDelete}
            className="h-9"
          >
            Delete
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={onClear}
            className="h-9"
          >
            Clear
          </Button>
        </div>
      </div>
    </div>
  )
}
