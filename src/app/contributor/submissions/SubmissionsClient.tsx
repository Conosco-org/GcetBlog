'use client'

import type { Post } from '@/payload-types'
import { SearchInput } from '@/components/base/SearchInput'
import { FilterBar } from '@/components/base/FilterBar'
import { DataTable, type Column } from '@/components/base/DataTable'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { AlertCircle, Clock, CheckCircle2, XCircle, Eye, Edit } from 'lucide-react'
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

function getStatusBadge(status: string) {
  switch (status) {
    case 'pending_review':
      return (
        <Badge variant="outline" className="gap-1 border-yellow-500 text-yellow-700 dark:text-yellow-400">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>
      )
    case 'approved':
      return (
        <Badge variant="outline" className="gap-1 border-green-500 text-green-700 dark:text-green-400">
          <CheckCircle2 className="h-3 w-3" />
          Approved
        </Badge>
      )
    case 'rejected':
      return (
        <Badge variant="outline" className="gap-1 border-red-500 text-red-700 dark:text-red-400">
          <XCircle className="h-3 w-3" />
          Revision
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
    render: (post) => getStatusBadge(post.reviewStatus || 'draft'),
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
    render: (post) => (
      <div className="flex gap-2">
        {post.reviewStatus === 'rejected' && (
          <Button variant="default" size="sm" asChild>
            <Link href={`/contributor/edit/${post.id}`} prefetch={false}>
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Link>
          </Button>
        )}
        <Button variant="outline" size="sm" asChild>
          <Link href={`/api/draft?slug=${post.slug}&collection=posts`} target="_blank" rel="noopener noreferrer">
            <Eye className="h-3 w-3 mr-1" />
            Preview
          </Link>
        </Button>
      </div>
    ),
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
                { label: 'Approved', value: 'approved' },
                { label: 'Needs Revision', value: 'rejected' },
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
