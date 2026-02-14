import { getPayload, type Where } from 'payload'
import configPromise from '@payload-config'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { CheckCircle, XCircle, Edit, Upload, MessageSquare, User, Activity } from 'lucide-react'
import { PageHeader } from '@/components/base/PageHeader'
import { EmptyState } from '@/components/base/EmptyState'
import { LogsClient } from './LogsClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const PAGE_SIZE = 20

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string; action?: string }>
}

export default async function AdminLogsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const payload = await getPayload({ config: configPromise })

  const query = params.q || ''
  const page = Math.max(1, Number(params.page) || 1)
  const actionFilter = params.action || ''

  // Build where clause
  const conditions: Where[] = []

  if (query) {
    conditions.push({
      or: [
        { action: { like: query } },
        { resourceType: { like: query } },
        { resourceId: { like: query } },
      ],
    })
  }

  if (actionFilter) {
    conditions.push({ action: { like: actionFilter } })
  }

  const where: Where | undefined = conditions.length > 0 ? { and: conditions } : undefined

  const logs = await payload.find({
    collection: 'admin-logs',
    limit: PAGE_SIZE,
    page,
    sort: '-createdAt',
    depth: 1,
    where,
  })

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Activity Logs"
        description="Track all editorial and admin actions across the platform"
      />

      <LogsClient
        logs={logs.docs}
        totalPages={logs.totalPages}
        currentPage={logs.page || page}
        totalItems={logs.totalDocs}
        pageSize={PAGE_SIZE}
        query={query}
        actionFilter={actionFilter}
      />
    </div>
  )
}
