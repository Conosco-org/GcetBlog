'use client'

import type { Post } from '@/payload-types'
import { SearchInput } from '@/components/base/SearchInput'
import { FilterBar } from '@/components/base/FilterBar'
import { DataTable, type Column } from '@/components/base/DataTable'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { AlertCircle, Clock, CheckCircle2, Eye, Edit } from 'lucide-react'
import { formatDateTime } from '@/utilities/formatDateTime'

interface SubmissionsClientProps {
  submissions: Post[]
  totalPages: number
  currentPage: number
  totalItems: number
  pageSize: number
  query: string
  statusFilter: string
}

function getStatusBadge(post: Post) {
  const status = post.reviewStatus || 'draft'
  const hasFeedback = post.editorFeedback && status === 'draft'
  
  if (hasFeedback) {
    return (
      <Badge variant="outline" className="gap-1 border-orange-500 text-orange-700 dark:text-orange-400">
        <AlertCircle className="h-3 w-3" />
        Requesting Changes
      </Badge>
    )
  }
  
  switch (status) {
    case 'pending_review':
      return (
        <Badge variant="outline" className="gap-1 border-yellow-500 text-yellow-700 dark:text-yellow-400">
          <Clock className="h-3 w-3" />
          Pending Review
        </Badge>
      )
    case 'approved':
      return (
        <Badge variant="outline" className="gap-1 border-green-500 text-green-700 dark:text-green-400">
          <CheckCircle2 className="h-3 w-3" />
          Approved
        </Badge>
      )
    default:
      return (
        <Badge variant="outline" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          {status}
        </Badge>
      )
  }
}

const columns: Column<Post>[] = [
  {
    key: 'title',
    header: 'Title',
    render: (post) => <span className="font-medium">{post.title}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    render: (post) => getStatusBadge(post),
  },
  {
    key: 'submitted',
    header: 'Submitted',
    render: (post) => (
      <span className="text-sm text-muted-foreground">
        {post.submittedForReviewAt ? formatDateTime(post.submittedForReviewAt) : 'N/A'}
      </span>
    ),
  },
  {
    key: 'updated',
    header: 'Updated',
    render: (post) => (
      <span className="text-sm text-muted-foreground">{formatDateTime(post.updatedAt)}</span>
    ),
  },
  {
    key: 'actions',
    header: 'Actions',
    render: (post) => {
      const status = post.reviewStatus || 'draft'
      const hasFeedback = post.editorFeedback && status === 'draft'
      const canEdit = hasFeedback || status === 'pending_review'
      
      return (
        <div className="flex gap-2">
          {canEdit && (
            <Button variant="default" size="sm" asChild>
              <Link href={`/editor/posts/${post.id}/edit`}>
                <Edit className="h-3 w-3 mr-1" />
                Edit
              </Link>
            </Button>
          )}
          <Button variant="outline" size="sm" asChild>
            <Link href={status === 'approved' ? `/posts/${post.slug}` : `/api/draft?slug=${post.slug}`} target="_blank">
              <Eye className="h-3 w-3 mr-1" />
              {status === 'approved' ? 'View' : 'Preview'}
            </Link>
          </Button>
        </div>
      )
    },
  },
]

export function SubmissionsClient({
  submissions,
  totalPages,
  currentPage,
  totalItems,
  pageSize,
  query,
  statusFilter,
}: SubmissionsClientProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchInput
          placeholder="Search submissions..."
          defaultValue={query}
          paramName="q"
          className="flex-1 max-w-md"
        />
        <FilterBar
          filters={[
            {
              paramName: 'status',
              label: 'Status',
              options: [
                { label: 'All Statuses', value: '' },
                { label: 'Pending Review', value: 'pending_review' },
                { label: 'Requesting Changes', value: 'requesting_changes' },
                { label: 'Approved', value: 'approved' },
              ],
            },
          ]}
        />
      </div>

      <DataTable
        columns={columns}
        data={submissions}
        totalPages={totalPages}
        currentPage={currentPage}
        totalItems={totalItems}
        pageSize={pageSize}
        getRowKey={(post) => post.id}
        emptyState={{
          icon: AlertCircle,
          title: 'No submissions found',
          description: query || statusFilter
            ? 'Try adjusting your search or filters'
            : 'Submit your first post for review to see it here',
          action: (
            <Button asChild>
              <Link href="/contributor/create">Create New Post</Link>
            </Button>
          ),
        }}
      />
    </div>
  )
}
