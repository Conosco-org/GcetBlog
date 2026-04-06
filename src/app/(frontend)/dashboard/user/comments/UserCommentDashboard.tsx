'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/frontend/components/ui/card'
import { Badge } from '@/frontend/components/ui/badge'
import { Button } from '@frontend/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/frontend/components/ui/tabs'
import { Trash2, ExternalLink, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { deleteOwnComment } from './actions'
import { useRouter } from 'next/navigation'
import { useToast } from '@/frontend/components/ui/use-toast'
import type { Comment } from '@/shared/types/payload-types'

interface UserCommentDashboardProps {
  myComments: Comment[]
  reportedComments: Comment[]
  userId: string
}

export function UserCommentDashboard({
  myComments,
  reportedComments,
}: UserCommentDashboardProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(commentId: string) {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return
    }

    setDeletingId(commentId)

    try {
      const formData = new FormData()
      formData.append('commentId', commentId)

      const result = await deleteOwnComment(formData)

      if (result.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Success',
          description: 'Comment deleted successfully',
        })
        router.refresh()
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete comment',
        variant: 'destructive',
      })
    } finally {
      setDeletingId(null)
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'spam':
        return <AlertCircle className="h-4 w-4 text-orange-500" />
      default:
        return <Clock className="h-4 w-4 text-blue-500" />
    }
  }

  function getStatusBadge(status: string | null | undefined) {
    const safeStatus = status || 'pending'
    const variants: Record<string, 'default' | 'destructive' | 'secondary' | 'outline'> = {
      approved: 'default',
      rejected: 'destructive',
      spam: 'secondary',
      pending: 'outline',
    }

    return (
      <Badge variant={variants[safeStatus] || 'outline'} className="flex items-center gap-1">
        {getStatusIcon(safeStatus)}
        {safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1)}
      </Badge>
    )
  }

  return (
    <Tabs defaultValue="my-comments" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="my-comments">
          My Comments ({myComments.length})
        </TabsTrigger>
        <TabsTrigger value="reported">
          Reported Comments ({reportedComments.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="my-comments" className="space-y-4">
        {myComments.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">You haven&apos;t posted any comments yet</p>
            </CardContent>
          </Card>
        ) : (
          myComments.map((comment) => (
            <Card key={comment.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base font-medium mb-2">
                      {typeof comment.post === 'object' && comment.post !== null ? (
                        <Link
                          href={`/posts/${comment.post.slug}`}
                          className="hover:underline flex items-center gap-2"
                        >
                          {comment.post.title}
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      ) : (
                        <span>Post</span>
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </span>
                      <span>•</span>
                      {getStatusBadge(comment.status)}
                    </div>
                  </div>
                  {comment.status !== 'approved' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(comment.id)}
                      disabled={deletingId === comment.id}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{comment.content}</p>
              </CardContent>
            </Card>
          ))
        )}
      </TabsContent>

      <TabsContent value="reported" className="space-y-4">
        {reportedComments.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">You haven&apos;t reported any comments</p>
            </CardContent>
          </Card>
        ) : (
          reportedComments.map((comment) => (
            <Card key={comment.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base font-medium mb-2">
                      {typeof comment.post === 'object' && comment.post !== null ? (
                        <Link
                          href={`/posts/${comment.post.slug}`}
                          className="hover:underline flex items-center gap-2"
                        >
                          {comment.post.title}
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      ) : (
                        <span>Post</span>
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>
                        Reported {formatDistanceToNow(new Date(comment.reportedAt!), { addSuffix: true })}
                      </span>
                      <span>•</span>
                      {comment.reportResolvedAt ? (
                        <Badge variant="outline" className="text-green-600">
                          Resolved
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-orange-600">
                          Pending Review
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">{comment.content}</p>
                {comment.reportReason && (
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Your Report Reason:</p>
                    <p className="text-sm">{comment.reportReason}</p>
                  </div>
                )}
                {comment.reportResolvedAt && comment.reportResolutionAction && (
                  <div className="bg-green-50 dark:bg-green-950 p-3 rounded-md">
                    <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">
                      Resolution:
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-300">
                      {comment.reportResolutionAction === 'no-action'
                        ? 'No action taken'
                        : `Comment ${comment.reportResolutionAction}`}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </TabsContent>
    </Tabs>
  )
}
