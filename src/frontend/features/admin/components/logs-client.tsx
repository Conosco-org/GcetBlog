'use client'

import { Badge } from '@frontend/components/ui/badge'
import { SearchInput } from '@frontend/components/base/SearchInput'
import { FilterBar } from '@frontend/components/base/FilterBar'
import { DataTable, type Column } from '@frontend/components/base/DataTable'
import { Activity, CheckCircle, XCircle, Edit, Upload, MessageSquare, User, LayoutTemplate } from 'lucide-react'
import type { AdminLog } from '@shared/types/payload-types'

interface LogsClientProps {
  logs: AdminLog[]
  totalPages: number
  currentPage: number
  totalItems: number
  pageSize: number
  query: string
  actionFilter: string
}

function getActivityIcon(action: string) {
  if (action.startsWith('template_'))
    return <LayoutTemplate className="w-4 h-4 text-indigo-500 flex-shrink-0" />
  if (action.includes('approved') || action.includes('published'))
    return <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
  if (action.includes('rejected') || action.includes('deleted'))
    return <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
  if (action.includes('edited') || action.includes('updated'))
    return <Edit className="w-4 h-4 text-blue-500 flex-shrink-0" />
  if (action.includes('uploaded') || action.includes('created'))
    return <Upload className="w-4 h-4 text-purple-500 flex-shrink-0" />
  if (action.includes('comment'))
    return <MessageSquare className="w-4 h-4 text-orange-500 flex-shrink-0" />
  return <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
}

const columns: Column<AdminLog>[] = [
  {
    key: 'user',
    header: 'User',
    render: (log) => {
      const logUser = typeof log.user === 'object' && log.user ? log.user : null
      return (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
            {(logUser?.name || 'U').charAt(0).toUpperCase()}
          </div>
          <span className="font-medium text-sm">{logUser?.name || 'Unknown'}</span>
        </div>
      )
    },
  },
  {
    key: 'action',
    header: 'Action',
    render: (log) => (
      <div className="flex items-center gap-2">
        {getActivityIcon(log.action)}
        <Badge variant="outline" className="text-xs">
          {log.action}
        </Badge>
      </div>
    ),
  },
  {
    key: 'resource',
    header: 'Resource',
    render: (log) => {
      const resourceType = log.resourceType
        ? log.resourceType.charAt(0).toUpperCase() + log.resourceType.slice(1)
        : 'Unknown'
      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{resourceType}</span>
          {log.details && (
            <span className="text-xs text-muted-foreground line-clamp-1">{log.details}</span>
          )}
        </div>
      )
    },
  },
  {
    key: 'date',
    header: 'Date',
    render: (log) => (
      <span className="text-sm text-muted-foreground">
        {new Date(log.createdAt).toLocaleString()}
      </span>
    ),
  },
]

export function LogsClient({
  logs,
  totalPages,
  currentPage,
  totalItems,
  pageSize,
  query,
  actionFilter,
}: LogsClientProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchInput
          placeholder="Search logs..."
          defaultValue={query}
          paramName="q"
          className="flex-1 max-w-md"
        />
        <FilterBar
          filters={[
            {
              paramName: 'action',
              label: 'Action',
              options: [
                { label: 'All Actions', value: '' },
                { label: 'Approved', value: 'approved' },
                { label: 'Rejected', value: 'rejected' },
                { label: 'Created', value: 'created' },
                { label: 'Updated', value: 'updated' },
                { label: 'Deleted', value: 'deleted' },
                { label: 'Template', value: 'template' },
              ],
            },
          ]}
        />
      </div>

      <DataTable
        columns={columns}
        data={logs}
        totalPages={totalPages}
        currentPage={currentPage}
        totalItems={totalItems}
        pageSize={pageSize}
        getRowKey={(log) => log.id}
        emptyState={{
          icon: Activity,
          title: 'No activity logs found',
          description: query || actionFilter
            ? 'Try adjusting your search or filters'
            : 'Activity will appear here as actions are performed',
        }}
      />
    </div>
  )
}
