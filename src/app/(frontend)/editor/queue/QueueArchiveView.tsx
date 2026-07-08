'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArchiveRestore, Trash2 } from 'lucide-react'

import { Badge } from '@frontend/components/ui/badge'
import { Button } from '@frontend/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@frontend/components/ui/table'
import { useToast } from '@frontend/components/ui/use-toast'
import type { ArchivedPost } from '@/shared/types/payload-types'

interface QueueArchiveViewProps {
  archivedPosts: ArchivedPost[]
}

function getContributorName(record: ArchivedPost) {
  if (typeof record.contributor === 'object' && record.contributor && 'name' in record.contributor) {
    return String(record.contributor.name || 'Unknown')
  }
  return 'Unknown'
}

function getDaysRemaining(archivedAt?: string | null) {
  if (!archivedAt) return 0
  const archivedTime = new Date(archivedAt).getTime()
  if (Number.isNaN(archivedTime)) return 0
  const elapsedDays = Math.floor((Date.now() - archivedTime) / 86400000)
  return Math.max(0, 30 - elapsedDays)
}

async function parseArchiveResponse(response: Response) {
  const data = await response.json()
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Archive operation failed')
  }
  return data
}

export function QueueArchiveView({ archivedPosts }: QueueArchiveViewProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [processingArchiveId, setProcessingArchiveId] = useState<string | null>(null)

  const restorePost = async (record: ArchivedPost) => {
    setProcessingArchiveId(record.id)
    try {
      const response = await fetch('/api/archive/restore-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ archiveId: record.id }),
      })
      await parseArchiveResponse(response)
      toast({
        title: 'Post restored',
        description: `"${record.postTitle}" returned to the review queue.`,
      })
      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to restore post',
        variant: 'destructive',
      })
    } finally {
      setProcessingArchiveId(null)
    }
  }

  const deleteArchivedPost = async (record: ArchivedPost) => {
    if (!confirm(`Delete archive record for "${record.postTitle}" and mark the contributor post as removed?`)) return

    setProcessingArchiveId(record.id)
    try {
      const response = await fetch('/api/archive/delete-archived', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ archiveId: record.id }),
      })
      await parseArchiveResponse(response)
      toast({
        title: 'Archived post deleted',
        description: 'The archive record was deleted and the contributor message was saved on the post.',
      })
      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete archived post',
        variant: 'destructive',
      })
    } finally {
      setProcessingArchiveId(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Archive Management</CardTitle>
      </CardHeader>
      <CardContent>
        {archivedPosts.length === 0 ? (
          <div className="text-sm text-muted-foreground py-8 text-center">
            No archived posts.
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Post</TableHead>
                  <TableHead>Contributor</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Archived</TableHead>
                  <TableHead>Retention</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {archivedPosts.map((post) => {
                  const daysRemaining = getDaysRemaining(post.archivedAt)
                  const processing = processingArchiveId === post.id
                  return (
                    <TableRow key={post.id}>
                      <TableCell className="font-medium">{post.postTitle}</TableCell>
                      <TableCell>{getContributorName(post)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{post.archiveReason || 'manual'}</Badge>
                      </TableCell>
                      <TableCell>
                        {post.archivedAt ? new Date(post.archivedAt).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>{daysRemaining} days left</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={processing || daysRemaining <= 0}
                            onClick={() => restorePost(post)}
                          >
                            <ArchiveRestore className="h-4 w-4 mr-1" />
                            Restore
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={processing}
                            onClick={() => deleteArchivedPost(post)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
