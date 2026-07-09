'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArchiveRestore, Search, Trash2 } from 'lucide-react'

import { Badge } from '@frontend/components/ui/badge'
import { Button } from '@frontend/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/card'
import { Checkbox } from '@frontend/components/ui/checkbox'
import { Input } from '@frontend/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@frontend/components/ui/table'
import { PaginationControls } from '@/frontend/components/base'
import { useToast } from '@frontend/components/ui/use-toast'
import type { ArchivedComment, ArchivedPost } from '@/shared/types/payload-types'
import { ArchiveSettingsPanel, type ArchiveConfigView } from './ArchiveSettingsPanel'

interface ArchivePageResult<T> {
  docs: T[]
  totalDocs: number
  totalPages: number
  page?: number
  limit?: number
  hasPrevPage?: boolean
  hasNextPage?: boolean
}

interface QueueArchiveViewProps {
  archivedPosts: ArchivePageResult<ArchivedPost>
  archivedComments: ArchivePageResult<ArchivedComment>
  config: ArchiveConfigView
  isAdmin: boolean
}

type ArchiveType = 'posts' | 'comments'

function relationshipName(value: unknown, fallback = 'Unknown') {
  if (value && typeof value === 'object' && 'name' in value) {
    return String((value as { name?: string | null }).name || fallback)
  }
  return fallback
}

function relationshipTitle(value: unknown, fallback = 'Unknown post') {
  if (value && typeof value === 'object' && 'title' in value) {
    return String((value as { title?: string | null }).title || fallback)
  }
  return fallback
}

function daysRemaining(archivedAt: string | null | undefined, retentionDays: number) {
  if (!archivedAt) return 0
  const archivedTime = new Date(archivedAt).getTime()
  if (Number.isNaN(archivedTime)) return 0
  return Math.max(0, retentionDays - Math.floor((Date.now() - archivedTime) / 86400000))
}

export function QueueArchiveView({
  archivedPosts,
  archivedComments,
  config,
  isAdmin,
}: QueueArchiveViewProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [type, setType] = useState<ArchiveType>('posts')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [processing, setProcessing] = useState(false)

  const records = type === 'posts' ? archivedPosts.docs : archivedComments.docs
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return records
    return records.filter((record) => {
      if (type === 'posts') {
        const post = record as ArchivedPost
        return `${post.postTitle} ${relationshipName(post.contributor)}`.toLowerCase().includes(normalized)
      }
      const comment = record as ArchivedComment
      return `${comment.contentSnapshot} ${comment.authorName || ''} ${relationshipTitle(comment.post)}`
        .toLowerCase()
        .includes(normalized)
    })
  }, [query, records, type])

  const visibleIds = filtered.map((record) => record.id)
  const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.includes(id))
  const retentionDays =
    type === 'posts' ? config.postArchiveRetentionDays : config.commentArchiveRetentionDays
  const pageResult = type === 'posts' ? archivedPosts : archivedComments

  const switchType = (nextType: ArchiveType) => {
    setType(nextType)
    setSelected([])
    setQuery('')
  }

  const toggleAll = (checked: boolean) => {
    setSelected(checked ? visibleIds : [])
  }

  const runAction = async (action: 'restore' | 'delete', ids: string[]) => {
    if (ids.length === 0) return
    const actionLabel = action === 'restore' ? 'restore' : 'permanently delete'
    if (!confirm(`${actionLabel.charAt(0).toUpperCase() + actionLabel.slice(1)} ${ids.length} archived ${type}?`)) return

    setProcessing(true)
    try {
      const response = await fetch(
        action === 'restore' ? '/api/archive/bulk-restore' : '/api/archive/bulk-delete',
        {
          method: action === 'restore' ? 'POST' : 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, archiveIds: ids }),
        },
      )
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Archive operation failed')
      toast({
        title: action === 'restore' ? 'Restore complete' : 'Deletion complete',
        description: data.message,
        variant: data.failed?.length ? 'destructive' : 'default',
      })
      setSelected([])
      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Archive operation failed',
        variant: 'destructive',
      })
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      {isAdmin && <ArchiveSettingsPanel config={config} />}

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Archive Management</CardTitle>
            <div className="flex gap-2">
              <Button variant={type === 'posts' ? 'default' : 'outline'} onClick={() => switchType('posts')}>
                Posts ({archivedPosts.totalDocs})
              </Button>
              <Button variant={type === 'comments' ? 'default' : 'outline'} onClick={() => switchType('comments')}>
                Comments ({archivedComments.totalDocs})
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder={`Search archived ${type}...`}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            {selected.length > 0 && (
              <div className="flex gap-2">
                <Button variant="outline" disabled={processing} onClick={() => runAction('restore', selected)}>
                  <ArchiveRestore className="mr-2 h-4 w-4" />
                  Restore ({selected.length})
                </Button>
                <Button variant="destructive" disabled={processing} onClick={() => runAction('delete', selected)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete ({selected.length})
                </Button>
              </div>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">No archived {type}.</div>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox checked={allSelected} onCheckedChange={(value) => toggleAll(value === true)} />
                    </TableHead>
                    <TableHead>{type === 'posts' ? 'Post' : 'Comment'}</TableHead>
                    <TableHead>{type === 'posts' ? 'Contributor' : 'Post / Author'}</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Archived</TableHead>
                    <TableHead>Retention</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((record) => {
                    const remaining = daysRemaining(record.archivedAt, retentionDays)
                    const title =
                      type === 'posts'
                        ? (record as ArchivedPost).postTitle
                        : (record as ArchivedComment).contentSnapshot
                    const context =
                      type === 'posts'
                        ? relationshipName((record as ArchivedPost).contributor)
                        : `${relationshipTitle((record as ArchivedComment).post)} / ${
                            (record as ArchivedComment).authorName ||
                            relationshipName((record as ArchivedComment).author, 'Anonymous')
                          }`
                    return (
                      <TableRow key={record.id}>
                        <TableCell>
                          <Checkbox
                            checked={selected.includes(record.id)}
                            onCheckedChange={(value) =>
                              setSelected((current) =>
                                value === true
                                  ? [...new Set([...current, record.id])]
                                  : current.filter((id) => id !== record.id),
                              )
                            }
                          />
                        </TableCell>
                        <TableCell className="max-w-sm font-medium">
                          <span className={type === 'comments' ? 'line-clamp-2' : ''}>{title}</span>
                        </TableCell>
                        <TableCell>{context}</TableCell>
                        <TableCell><Badge variant="secondary">{record.archiveReason || 'manual'}</Badge></TableCell>
                        <TableCell>{new Date(record.archivedAt).toLocaleDateString()}</TableCell>
                        <TableCell>{remaining} days left</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              size="icon"
                              variant="outline"
                              title="Restore"
                              disabled={processing || remaining <= 0}
                              onClick={() => runAction('restore', [record.id])}
                            >
                              <ArchiveRestore className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="destructive"
                              title="Permanently delete"
                              disabled={processing}
                              onClick={() => runAction('delete', [record.id])}
                            >
                              <Trash2 className="h-4 w-4" />
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

          {pageResult.totalPages > 1 && (
            <PaginationControls
              currentPage={pageResult.page || 1}
              totalPages={pageResult.totalPages}
              totalDocs={pageResult.totalDocs}
              limit={pageResult.limit || 10}
              hasPrevPage={pageResult.hasPrevPage || false}
              hasNextPage={pageResult.hasNextPage || false}
              showingCount={pageResult.docs.length}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
