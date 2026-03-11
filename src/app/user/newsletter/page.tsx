/**
 * Newsletter Dashboard - Editor View
 *
 * Shows campaign overview, stats, and recent newsletters.
 * Editors can create, manage, and send newsletters.
 */

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Link from 'next/link'
import { PageHeader } from '@/components/base/PageHeader'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/base/EmptyState'
import { SearchInput } from '@/components/base/SearchInput'
import { FilterBar } from '@/components/base/FilterBar'
import { Mail, Plus, Send, Users, TrendingUp, FileText } from 'lucide-react'
import { NewslettersTable } from './NewslettersTable'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{
    page?: string
    q?: string
    status?: string
    type?: string
  }>
}

export default async function NewsletterDashboardPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const query = params.q || ''
  const statusFilter = params.status || ''
  const typeFilter = params.type || ''

  const payload = await getPayload({ config: configPromise })

  // Fetch all stats in a single parallel round-trip
  const [subscribersCount, campaignsCount, draftsCount, newsletters, sentNewsletters] = await Promise.all([
    // Total active subscribers
    payload.count({
      collection: 'newsletter-subscribers',
      where: { status: { equals: 'active' } },
    }),

    // Total sent campaigns
    payload.count({
      collection: 'newsletters',
      where: { status: { equals: 'sent' } },
    }),

    // Draft campaigns
    payload.count({
      collection: 'newsletters',
      where: { status: { equals: 'draft' } },
    }),

    // Recent newsletters (paginated, searchable, filterable)
    payload.find({
      collection: 'newsletters',
      page,
      limit: 10,
      sort: '-createdAt',
      where: {
        and: [
          query
            ? {
                or: [
                  { title: { like: query } },
                  { subject: { like: query } },
                ],
              }
            : {},
          statusFilter ? { status: { equals: statusFilter } } : {},
          typeFilter ? { type: { equals: typeFilter } } : {},
        ],
      },
    }),

    // Sent newsletters for open rate calc (moved into parallel block)
    payload.find({
      collection: 'newsletters',
      where: { status: { equals: 'sent' } },
      limit: 50,
      depth: 0,
      select: { stats: true },
    }),
  ])

  const totalRecipients = sentNewsletters.docs.reduce(
    (sum, n) => sum + (n.stats?.totalRecipients ?? 0),
    0,
  )
  const totalOpened = sentNewsletters.docs.reduce(
    (sum, n) => sum + (n.stats?.opened ?? 0),
    0,
  )
  const avgOpenRate = totalRecipients > 0 ? ((totalOpened / totalRecipients) * 100).toFixed(1) : '0.0'

  return (
    <div className="p-8 min-h-screen">
      <PageHeader
        title="Newsletter"
        description="Manage email campaigns and subscriber communications"
        action={
          <Button asChild>
            <Link href="/user/newsletter/compose">
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </Link>
          </Button>
        }
      />

      {/* Stats */}
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <StatCard
          icon={Users}
          label="Active Subscribers"
          value={subscribersCount.totalDocs.toLocaleString()}
          color="blue"
          href="/user/newsletter/subscribers"
        />
        <StatCard
          icon={Send}
          label="Campaigns Sent"
          value={campaignsCount.totalDocs.toLocaleString()}
          color="green"
        />
        <StatCard
          icon={TrendingUp}
          label="Avg Open Rate"
          value={`${avgOpenRate}%`}
          color="purple"
        />
        <StatCard
          icon={FileText}
          label="Drafts"
          value={draftsCount.totalDocs.toLocaleString()}
          color="amber"
        />
      </div>

      {/* Search + Filters */}
      <div className="mt-6 flex flex-col md:flex-row gap-3">
        <div className="flex-1">
          <SearchInput placeholder="Search campaigns..." defaultValue={query} paramName="q" />
        </div>
        <FilterBar
          filters={[
            {
              paramName: 'status',
              label: 'Status',
              options: [
                { label: 'All', value: '' },
                { label: 'Draft', value: 'draft' },
                { label: 'Scheduled', value: 'scheduled' },
                { label: 'Sent', value: 'sent' },
                { label: 'Sending', value: 'sending' },
                { label: 'Failed', value: 'failed' },
              ],
            },
            {
              paramName: 'type',
              label: 'Type',
              options: [
                { label: 'All', value: '' },
                { label: 'Manual', value: 'manual' },
                { label: 'Auto-Digest', value: 'auto_digest' },
              ],
            },
          ]}
        />
      </div>

      {/* Campaigns Table */}
      {newsletters.docs.length === 0 && !query && !statusFilter && !typeFilter ? (
        <Card className="mt-6 p-12">
          <EmptyState
            icon={Mail}
            title="No campaigns yet"
            description="Create your first email campaign to engage with your subscribers."
            action={
              <Button asChild>
                <Link href="/user/newsletter/compose">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Campaign
                </Link>
              </Button>
            }
          />
        </Card>
      ) : newsletters.docs.length === 0 ? (
        <Card className="mt-6 p-12">
          <EmptyState
            icon={Mail}
            title="No results found"
            description="Try adjusting your search or filters."
          />
        </Card>
      ) : (
        <NewslettersTable
          newsletters={newsletters.docs}
          totalPages={newsletters.totalPages}
          currentPage={page}
        />
      )}
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  color: string
  href?: string
}) {
  const colorMap: Record<string, string> = {
    blue: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900',
    green: 'text-green-600 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900',
    purple:
      'text-purple-600 bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900',
    amber:
      'text-amber-600 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900',
  }

  const content = (
    <>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4" />
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
      </div>
      <p className="text-3xl font-bold">{value}</p>
    </>
  )

  const className = `rounded-lg border p-4 ${colorMap[color] || ''} ${href ? 'hover:shadow-md transition cursor-pointer' : ''}`

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    )
  }

  return <div className={className}>{content}</div>
}

