/**
 * Newsletter Subscribers Management Page
 *
 * View, search, filter, import, and export subscribers.
 */

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { Where } from 'payload'

import { PageHeader } from '@frontend/components/base/PageHeader'
import { EmptyState } from '@frontend/components/base/EmptyState'
import { SearchInput } from '@frontend/components/base/SearchInput'
import { FilterBar } from '@frontend/components/base/FilterBar'
import { Card } from '@/frontend/components/ui/card'
import { Users } from 'lucide-react'
import { SubscribersTable } from './SubscribersTable'
import { SubscriberActions } from './SubscriberActions'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{
    page?: string
    q?: string
    status?: string
    frequency?: string
  }>
}

export default async function SubscribersPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const query = params.q || ''
  const statusFilter = params.status || ''
  const frequencyFilter = params.frequency || ''

  const payload = await getPayload({ config: configPromise })

  // Build where conditions
  const whereConditions: Array<Record<string, unknown>> = []

  if (query) {
    whereConditions.push({
      or: [{ email: { like: query } }, { name: { like: query } }],
    })
  }

  if (statusFilter) {
    whereConditions.push({ status: { equals: statusFilter } })
  }

  if (frequencyFilter) {
    whereConditions.push({ frequency: { equals: frequencyFilter } })
  }

  const where: Where | undefined =
    whereConditions.length > 0 ? ({ and: whereConditions } as Where) : undefined

  // Fetch subscribers
  const subscribers = await payload.find({
    collection: 'newsletter-subscribers',
    page,
    limit: 20,
    sort: '-createdAt',
    where,
    depth: 0,
  })

  // Fetch stats
  const [totalActive, totalPending, totalUnsubscribed] = await Promise.all([
    payload.count({
      collection: 'newsletter-subscribers',
      where: { status: { equals: 'active' } },
    }),
    payload.count({
      collection: 'newsletter-subscribers',
      where: { status: { equals: 'pending' } },
    }),
    payload.count({
      collection: 'newsletter-subscribers',
      where: { status: { equals: 'unsubscribed' } },
    }),
  ])

  return (
    <div className="p-8 min-h-screen">
      <PageHeader
        title="Subscribers"
        description={`Manage your ${totalActive.totalDocs.toLocaleString()} active subscribers`}
        action={
          <SubscriberActions
            statusFilter={statusFilter}
            frequencyFilter={frequencyFilter}
          />
        }
      />

      {/* Stats Cards */}
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-green-600" />
            <p className="text-sm font-medium text-muted-foreground">Active</p>
          </div>
          <p className="text-3xl font-bold">{totalActive.totalDocs.toLocaleString()}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-amber-600" />
            <p className="text-sm font-medium text-muted-foreground">Pending</p>
          </div>
          <p className="text-3xl font-bold">{totalPending.totalDocs.toLocaleString()}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-red-600" />
            <p className="text-sm font-medium text-muted-foreground">Unsubscribed</p>
          </div>
          <p className="text-3xl font-bold">{totalUnsubscribed.totalDocs.toLocaleString()}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-blue-600" />
            <p className="text-sm font-medium text-muted-foreground">Total</p>
          </div>
          <p className="text-3xl font-bold">{subscribers.totalDocs.toLocaleString()}</p>
        </Card>
      </div>

      {/* Search + Filters */}
      <div className="mt-6 flex flex-col md:flex-row gap-3">
        <div className="flex-1">
          <SearchInput
            placeholder="Search by email or name..."
            defaultValue={query}
            paramName="q"
          />
        </div>
        <FilterBar
          filters={[
            {
              paramName: 'status',
              label: 'Status',
              options: [
                { label: 'All', value: '' },
                { label: 'Active', value: 'active' },
                { label: 'Pending', value: 'pending' },
                { label: 'Unsubscribed', value: 'unsubscribed' },
                { label: 'Bounced', value: 'bounced' },
                { label: 'Complained', value: 'complained' },
              ],
            },
            {
              paramName: 'frequency',
              label: 'Frequency',
              options: [
                { label: 'All', value: '' },
                { label: 'Daily', value: 'daily' },
                { label: 'Weekly', value: 'weekly' },
                { label: 'Monthly', value: 'monthly' },
              ],
            },
          ]}
        />
      </div>

      {/* Subscribers Table */}
      {subscribers.docs.length === 0 && !query && !statusFilter && !frequencyFilter ? (
        <Card className="mt-6 p-12">
          <EmptyState
            icon={Users}
            title="No subscribers yet"
            description="Subscribers will appear here once they sign up for your newsletter."
          />
        </Card>
      ) : subscribers.docs.length === 0 ? (
        <Card className="mt-6 p-12">
          <EmptyState
            icon={Users}
            title="No results found"
            description="Try adjusting your search or filters."
          />
        </Card>
      ) : (
        <SubscribersTable
          subscribers={subscribers.docs}
          totalPages={subscribers.totalPages}
          currentPage={page}
        />
      )}
    </div>
  )
}
