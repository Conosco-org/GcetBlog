'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { CommentCard } from '@/components/shared/comments/CommentCard'
import { deleteOwnComment } from '@/lib/comments/actions'
import { Trash2 } from 'lucide-react'
import type { Comment } from '@/payload-types'

interface MyCommentsViewProps {
  myComments: Comment[]
}

export function MyCommentsView({ myComments }: MyCommentsViewProps) {
  const router = useRouter()
  const { toast } = useToast()

  const handleDelete = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return

    const result = await deleteOwnComment(commentId)

    if (result.success) {
      toast({ title: 'Success', description: result.message })
      router.refresh()
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
    }
  }

  return (
    <div>
      {myComments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground bg-muted rounded-md">
          You haven&apos;t posted any comments yet
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {myComments.map((comment) => (
            <div key={comment.id} className="relative">
              <CommentCard comment={comment} showActions={false} showCheckbox={false} />
              {comment.status !== 'approved' && (
                <div className="absolute top-4 right-4">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(comment.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
