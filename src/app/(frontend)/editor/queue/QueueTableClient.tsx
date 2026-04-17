'use client'

import type { Post } from '@/shared/types/payload-types'
import { SearchInput } from '@frontend/components/base/SearchInput'
import { DataTable, type Column } from '@frontend/components/base/DataTable'
import { PaginationControls } from '@/frontend/components/base'
import { Badge } from '@/frontend/components/ui/badge'
import { Card, CardContent } from '@/frontend/components/ui/card'
import { Clock } from 'lucide-react'
import { ApprovalButtons } from './ApprovalButtons'

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

const columns: Column<Post>[] = [
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
      return (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
            {(author?.name || 'U').charAt(0).toUpperCase()}
          </div>
          <span className="text-sm">{author?.name || 'Unknown'}</span>
        </div>
      )
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
    render: (post) => (
      <span className="text-muted-foreground text-sm">{getTimeAgo(post.updatedAt)}</span>
    ),
  },
  {
    key: 'actions',
    header: 'Actions',
    render: (post) => (
      <ApprovalButtons postId={post.id} postTitle={post.title} postSlug={post.slug || ''} />
    ),
  },
]

export function QueueTableClient({
  posts,
  query,
}: QueueTableClientProps) {
  return (
    <div className="space-y-4">
      <SearchInput
        placeholder="Search pending posts..."
        defaultValue={query}
        paramName="q"
        className="max-w-md"
      />

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
