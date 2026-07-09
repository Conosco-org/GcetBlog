'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Post } from '@/shared/types/payload-types'
import { SearchInput } from '@frontend/components/base/SearchInput'
import { DataTable, type Column } from '@frontend/components/base/DataTable'
import { PaginationControls } from '@/frontend/components/base'
import { Badge } from '@/frontend/components/ui/badge'
import { Card, CardContent } from '@/frontend/components/ui/card'
import { Clock } from 'lucide-react'
import { Archive } from 'lucide-react'
import { ApprovalButtons } from './ApprovalButtons'
import { Checkbox } from '@/frontend/components/ui/checkbox'
import { Button } from '@/frontend/components/ui/button'
import { useToast } from '@frontend/components/ui/use-toast'

interface QueueTableClientProps {
  posts: {
    docs: Post[]
    totalDocs: number
    totalPages: number
    page?: number
    limit?: number
    hasPrevPage?: boolean
    hasNextPage?: boolean
  }
  query: string
}

function getTimeAgo(date: string) {
  const now = new Date()
  const past = new Date(date)
  const diffMs = now.getTime() - past.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${diffDays}d ago`
}

export function QueueTableClient({
  posts,
  query,
}: QueueTableClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [selected, setSelected] = useState<string[]>([])
  const [archiving, setArchiving] = useState(false)
  const allSelected = posts.docs.length > 0 && posts.docs.every((post) => selected.includes(post.id))

  const toggleAll = (checked: boolean) => {
    setSelected(checked ? posts.docs.map((post) => post.id) : [])
  }

  const archiveSelected = async () => {
    if (!confirm(`Archive ${selected.length} selected posts?`)) return
    setArchiving(true)
    try {
      const response = await fetch('/api/archive/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'posts', ids: selected }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Failed to archive posts')
      toast({
        title: 'Bulk archive complete',
        description: data.message,
        variant: data.failed?.length ? 'destructive' : 'default',
      })
      setSelected([])
      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to archive posts',
        variant: 'destructive',
      })
    } finally {
      setArchiving(false)
    }
  }

  const columns: Column<Post>[] = [
    {
      key: 'select',
      header: (
        <Checkbox
          checked={allSelected}
          onCheckedChange={(value) => toggleAll(value === true)}
          aria-label="Select all visible posts"
        />
      ),
      render: (post) => (
        <Checkbox
          checked={selected.includes(post.id)}
          onCheckedChange={(value) =>
            setSelected((current) =>
              value === true
                ? [...new Set([...current, post.id])]
                : current.filter((id) => id !== post.id),
            )
          }
          aria-label={`Select ${post.title}`}
        />
      ),
    },
    {
      key: 'title',
      header: 'Title',
      render: (post) => <p className="font-medium">{post.title}</p>,
    },
    {
      key: 'author',
      header: 'Author',
      render: (post) => {
        const author =
          Array.isArray(post.authors) && post.authors.length > 0 && typeof post.authors[0] === 'object'
            ? post.authors[0]
            : null
        return <span className="text-sm">{author?.name || 'Unknown'}</span>
      },
    },
    {
      key: 'category',
      header: 'Category',
      render: (post) => {
        const category =
          Array.isArray(post.categories) && post.categories.length > 0 && typeof post.categories[0] === 'object'
            ? post.categories[0].title
            : 'Uncategorized'
        return <Badge variant="secondary">{category}</Badge>
      },
    },
    {
      key: 'submitted',
      header: 'Submitted',
      render: (post) => <span className="text-sm text-muted-foreground">{getTimeAgo(post.updatedAt)}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (post) => <ApprovalButtons postId={post.id} postTitle={post.title} postSlug={post.slug || ''} />,
    },
  ]

  return (
    <div className="space-y-4">
      <SearchInput
        placeholder="Search pending posts..."
        defaultValue={query}
        paramName="q"
        className="max-w-md"
      />

      {selected.length > 0 && (
        <Card className="border-primary/50">
          <CardContent className="flex items-center justify-between gap-4 p-4">
            <span className="text-sm font-medium">{selected.length} post(s) selected</span>
            <div className="flex gap-2">
              <Button size="sm" onClick={archiveSelected} disabled={archiving}>
                <Archive className="mr-2 h-4 w-4" />
                {archiving ? 'Archiving...' : 'Archive'}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelected([])} disabled={archiving}>
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={posts.docs}
            totalPages={posts.totalPages}
            currentPage={posts.page || 1}
            totalItems={posts.totalDocs}
            pageSize={posts.limit || 20}
            getRowKey={(post) => post.id}
            emptyState={{
              icon: Clock,
              title: 'No posts awaiting review',
              description: query
                ? 'Try adjusting your search'
                : 'All caught up! No pending submissions right now.',
            }}
          />
          
          {/* Pagination */}
          <PaginationControls
            currentPage={posts.page || 1}
            totalPages={posts.totalPages}
            totalDocs={posts.totalDocs}
            limit={posts.limit || 20}
            hasPrevPage={posts.hasPrevPage || false}
            hasNextPage={posts.hasNextPage || false}
            showingCount={posts.docs.length}
          />
        </CardContent>
      </Card>
    </div>
  )
}
