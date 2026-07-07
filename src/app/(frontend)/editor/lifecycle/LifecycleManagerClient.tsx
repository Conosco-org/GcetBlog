'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArchiveRestore, Save, Trash2 } from 'lucide-react'

import { Badge } from '@frontend/components/ui/badge'
import { Button } from '@frontend/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/card'
import { Input } from '@frontend/components/ui/input'
import { Label } from '@frontend/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@frontend/components/ui/select'
import { Switch } from '@frontend/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@frontend/components/ui/table'
import { useToast } from '@frontend/components/ui/use-toast'
import type { Post } from '@shared/types/payload-types'

interface LifecycleConfigForm {
  commentDeletionThreshold: number
  postArchiveThreshold: string
  autoArchiveEnabled: boolean
  jobSchedule: string
  dryRunEnabled: boolean
}

type ArchivedPost = Post & {
  archivedAt?: string | null
  archiveReason?: 'manual' | 'automated' | null
}

interface LifecycleManagerClientProps {
  archivedPosts: ArchivedPost[]
  isAdmin: boolean
  config: LifecycleConfigForm | null
}

function getContributorName(post: ArchivedPost) {
  const author = Array.isArray(post.authors) && post.authors.length > 0 ? post.authors[0] : null
  if (typeof author === 'object' && author && 'name' in author) {
    return String(author.name || 'Unknown')
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

async function parseLifecycleResponse(response: Response) {
  const data = await response.json()
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Lifecycle operation failed')
  }
  return data
}

export function LifecycleManagerClient({
  archivedPosts,
  isAdmin,
  config,
}: LifecycleManagerClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [processingPostId, setProcessingPostId] = useState<string | null>(null)
  const [form, setForm] = useState<LifecycleConfigForm>(
    config || {
      commentDeletionThreshold: 60,
      postArchiveThreshold: '60-days',
      autoArchiveEnabled: true,
      jobSchedule: 'daily',
      dryRunEnabled: true,
    },
  )

  const saveConfig = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/lifecycle/config', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })
      const data = await parseLifecycleResponse(response)
      toast({
        title: 'Settings saved',
        description: data.message || 'Lifecycle settings updated.',
      })
      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save settings',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const restorePost = async (post: ArchivedPost) => {
    setProcessingPostId(post.id)
    try {
      const response = await fetch('/api/lifecycle/restore-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId: post.id }),
      })
      await parseLifecycleResponse(response)
      toast({
        title: 'Post restored',
        description: `"${post.title}" returned to the review queue.`,
      })
      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to restore post',
        variant: 'destructive',
      })
    } finally {
      setProcessingPostId(null)
    }
  }

  const deleteArchivedPost = async (post: ArchivedPost) => {
    if (!confirm(`Remove "${post.title}" from active lifecycle views?`)) return

    setProcessingPostId(post.id)
    try {
      const response = await fetch('/api/lifecycle/delete-archived', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId: post.id }),
      })
      await parseLifecycleResponse(response)
      toast({
        title: 'Archived post removed',
        description: 'Contributor notice was retained.',
      })
      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete archived post',
        variant: 'destructive',
      })
    } finally {
      setProcessingPostId(null)
    }
  }

  return (
    <div className="space-y-6">
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Lifecycle Settings</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="commentDeletionThreshold">Comment deletion threshold</Label>
              <Input
                id="commentDeletionThreshold"
                type="number"
                min={1}
                max={3650}
                value={form.commentDeletionThreshold}
                onChange={(event) => setForm({ ...form, commentDeletionThreshold: Number(event.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Post archive threshold</Label>
              <Select
                value={form.postArchiveThreshold}
                onValueChange={(value) => setForm({ ...form, postArchiveThreshold: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15-days">15 Days</SelectItem>
                  <SelectItem value="30-days">30 Days (1 month)</SelectItem>
                  <SelectItem value="60-days">60 Days (2 months)</SelectItem>
                  <SelectItem value="90-days">90 Days (3 months)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Job schedule</Label>
              <Select
                value={form.jobSchedule}
                onValueChange={(value) => setForm({ ...form, jobSchedule: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between rounded-md border px-4 py-3">
              <div>
                <Label>Auto archive</Label>
                <p className="text-xs text-muted-foreground">Automatically archive stale pending posts.</p>
              </div>
              <Switch
                checked={form.autoArchiveEnabled}
                onCheckedChange={(checked) => setForm({ ...form, autoArchiveEnabled: checked })}
              />
            </div>
            <div className="flex items-center justify-between rounded-md border px-4 py-3 md:col-span-2">
              <div>
                <Label>Dry run mode</Label>
                <p className="text-xs text-muted-foreground">Scheduled jobs report candidates without changing records.</p>
              </div>
              <Switch
                checked={form.dryRunEnabled}
                onCheckedChange={(checked) => setForm({ ...form, dryRunEnabled: checked })}
              />
            </div>
            <div className="md:col-span-2">
              <Button onClick={saveConfig} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
                    const processing = processingPostId === post.id
                    return (
                      <TableRow key={post.id}>
                        <TableCell className="font-medium">{post.title}</TableCell>
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
    </div>
  )
}
