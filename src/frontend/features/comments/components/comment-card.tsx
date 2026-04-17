'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Button } from '@frontend/components/ui/button'
import { Badge } from '@frontend/components/ui/badge'
import { Card, CardContent } from '@frontend/components/ui/card'
import { Checkbox } from '@frontend/components/ui/checkbox'
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  FileText,
  Edit3,
  Loader2,
} from 'lucide-react'
import type { Comment } from '@shared/types/payload-types'

interface CommentCardProps {
  comment: Comment
  isSelected?: boolean
  onSelect?: (id: string, selected: boolean) => void
  onApprove?: (id: string) => Promise<void>
  onReject?: (id: string) => void
  onSpam?: (id: string) => void
  showActions?: boolean
  showCheckbox?: boolean
}

export function CommentCard({
  comment,
  isSelected = false,
  onSelect,
  onApprove,
  onReject,
  onSpam,
  showActions = true,
  showCheckbox = true,
}: CommentCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleApprove = async () => {
    if (!onApprove) return
    setIsLoading(true)
    try {
      await onApprove(comment.id)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = () => {
    switch (comment.status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      case 'spam':
        return <Badge className="bg-orange-100 text-orange-800">Spam</Badge>
      default:
        return null
    }
  }

  return (
    <Card className="border-l-4 border-l-yellow-400 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          {showCheckbox && onSelect && (
            <div className="pt-1">
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => onSelect(comment.id, checked === true)}
              />
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap flex-1">
            {getStatusBadge()}
            {comment.contentModified && (
              <Badge variant="outline" className="text-xs">
                <Edit3 className="w-3 h-3 mr-1" />
                Modified
              </Badge>
            )}
          </div>

          {showActions && (
            <div className="flex gap-1 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleApprove}
                disabled={isLoading}
                className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                title="Approve"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReject?.(comment.id)}
                disabled={isLoading}
                className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Reject"
              >
                <XCircle className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSpam?.(comment.id)}
                disabled={isLoading}
                className="h-8 px-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                title="Mark as Spam"
              >
                <AlertTriangle className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* User and Post Info Grid */}
        <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
          <div className="flex items-start gap-2">
            <User className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm truncate">
                {comment.author && typeof comment.author === 'object'
                  ? comment.author.name
                  : comment.authorName || 'Anonymous'}
              </p>
              {comment.authorEmail && (
                <p className="text-xs text-muted-foreground truncate">{comment.authorEmail}</p>
              )}
              {comment.author && typeof comment.author === 'object' && comment.author.email && (
                <p className="text-xs text-muted-foreground truncate">{comment.author.email}</p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-2">
            <FileText className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm truncate">
                {comment.post && typeof comment.post === 'object'
                  ? comment.post.title
                  : 'Unknown Post'}
              </p>
              <p className="text-xs text-muted-foreground">
                Posted {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        </div>

        {/* Comment Content */}
        <div className="bg-muted/50 p-3 rounded-md">
          <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{comment.content}</p>
        </div>
      </CardContent>
    </Card>
  )
}
