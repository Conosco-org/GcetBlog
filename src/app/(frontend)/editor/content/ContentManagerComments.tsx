'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/frontend/components/ui/card'
import { Badge } from '@/frontend/components/ui/badge'
import { Button } from '@frontend/components/ui/button'
import { Input } from '@/frontend/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/frontend/components/ui/select'
import { Checkbox } from '@/frontend/components/ui/checkbox'
import { Edit, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useToast } from '@frontend/components/ui/use-toast'
import { approveComments, deleteComments } from '@/frontend/features/comments/lib/comment-actions'
import { DeleteDialog } from '@/frontend/features/comments/components/moderation-dialogs'
import type { Comment } from '@/shared/types/payload-types'

interface ContentManagerCommentsProps {
  comments: Comment[]
}

export function ContentManagerComments({ comments }: ContentManagerCommentsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const filteredComments = comments.filter((comment) => {
    const matchesSearch = comment.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || comment.status === statusFilter
    return matchesSearch && matchesStatus
  })

  function toggleSelection(id: string) {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  function toggleSelectAll() {
    if (selectedIds.size === filteredComments.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredComments.map((c) => c.id)))
    }
  }

  async function handleApprove() {
    const result = await approveComments(Array.from(selectedIds))
    if (result.success) {
      toast({ title: 'Success', description: result.message })
      setSelectedIds(new Set())
      router.refresh()
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
    }
  }

  async function handleDelete() {
    const result = await deleteComments(Array.from(selectedIds))
    if (result.success) {
      toast({ title: 'Success', description: result.message })
      setSelectedIds(new Set())
      router.refresh()
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
    }
  }

  function getStatusBadge(status: string) {
    const config: Record<
      string,
      {
        variant: 'default' | 'destructive' | 'secondary' | 'outline'
        icon: React.ComponentType<{ className?: string }> | null
        label: string
      }
    > = {
      approved: { variant: 'default', icon: CheckCircle, label: 'Approved' },
      rejected: { variant: 'destructive', icon: XCircle, label: 'Rejected' },
      spam: { variant: 'secondary', icon: AlertCircle, label: 'Spam' },
      pending: { variant: 'outline', icon: null, label: 'Pending' },
    }

    const { variant, icon: Icon, label } = config[status] || config.pending

    return (
      <Badge variant={variant} className="flex items-center gap-1">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Search comments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="spam">Spam</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <Card className="border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{selectedIds.size} comment(s) selected</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleApprove}>
                  Approve
                </Button>
                <Button size="sm" variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                  Delete
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comments Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="p-4 text-left">
                    <Checkbox
                      checked={selectedIds.size === filteredComments.length && filteredComments.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </th>
                  <th className="p-4 text-left text-sm font-medium">Content</th>
                  <th className="p-4 text-left text-sm font-medium">Post</th>
                  <th className="p-4 text-left text-sm font-medium">Author</th>
                  <th className="p-4 text-left text-sm font-medium">Status</th>
                  <th className="p-4 text-left text-sm font-medium">Date</th>
                  <th className="p-4 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredComments.map((comment) => (
                  <tr key={comment.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">
                      <Checkbox
                        checked={selectedIds.has(comment.id)}
                        onCheckedChange={() => toggleSelection(comment.id)}
                      />
                    </td>
                    <td className="p-4">
                      <p className="text-sm line-clamp-2">{comment.content}</p>
                      {comment.contentModified && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          Modified
                        </Badge>
                      )}
                    </td>
                    <td className="p-4">
                      {comment.post && typeof comment.post === 'object' && (
                        <Link href={`/posts/${comment.post.slug}`} className="text-sm hover:underline">
                          {comment.post.title}
                        </Link>
                      )}
                    </td>
                    <td className="p-4 text-sm">
                      {comment.author && typeof comment.author === 'object'
                        ? comment.author.name
                        : 'Anonymous'}
                    </td>
                    <td className="p-4">{comment.status && getStatusBadge(comment.status)}</td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </td>
                    <td className="p-4">
                      <Button size="sm" variant="ghost">
                        <Edit className="h-3 w-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <DeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        commentCount={selectedIds.size}
      />
    </div>
  )
}
