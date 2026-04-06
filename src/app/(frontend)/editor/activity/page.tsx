import { getPayload, type Where } from 'payload'
import configPromise from '@payload-config'
import { PageHeader } from '@frontend/components/base/PageHeader'
import { ActivityClient } from './ActivityClient'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 20

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string; action?: string }>
}

export default async function ActivityLogsPage({ searchParams }: PageProps) {
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
    <div className="p-8 min-h-screen">
      <PageHeader
        title="Activity Logs"
        description="Track all editorial actions and changes"
      />

      <div className="mt-6">
        <ActivityClient
          logs={logs.docs}
          totalPages={logs.totalPages}
          currentPage={logs.page || page}
          totalItems={logs.totalDocs}
          pageSize={PAGE_SIZE}
          query={query}
          actionFilter={actionFilter}
        />
      </div>
    </div>
  )
}
