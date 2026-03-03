import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Link from 'next/link'
import { Plus, Calendar, ExternalLink, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Events Manager',
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

type Args = {
  searchParams: Promise<{
    q?: string
    status?: string
    source?: string
    page?: string
  }>
}

export default async function EditorEventsPage({ searchParams: searchParamsPromise }: Args) {
  const searchParams = await searchParamsPromise
  const query = searchParams.q || ''
  const statusFilter = searchParams.status || ''
  const sourceFilter = searchParams.source || ''
  const page = Number(searchParams.page || '1')

  const payload = await getPayload({ config: configPromise })

  // Build where clause
  const conditions: Record<string, unknown>[] = []
  if (query) {
    conditions.push({ title: { like: query } })
  }
  if (statusFilter) {
    conditions.push({ manualStatus: { equals: statusFilter } })
  }
  if (sourceFilter) {
    conditions.push({ dataSource: { equals: sourceFilter } })
  }

  const events = await payload.find({
    collection: 'events',
    page,
    limit: 20,
    sort: '-updatedAt',
    depth: 1,
    where: (conditions.length > 0 ? { and: conditions } : {}) as import('payload').Where,
  })

  return (
    <div className="p-8 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Calendar className="h-7 w-7" />
              Events Manager
            </h1>
            <p className="text-muted-foreground">Create and manage events for the platform</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/editor/events/sync-preview">
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Sync Preview
              </Button>
            </Link>
            <Link href="/admin/collections/events/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Event
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <input
          type="text"
          placeholder="Search events..."
          defaultValue={query}
          className="px-3 py-2 text-sm rounded-lg border border-border bg-background w-64"
        />
        <select
          defaultValue={statusFilter}
          className="px-3 py-2 text-sm rounded-lg border border-border bg-background"
        >
          <option value="">All Status</option>
          <option value="upcoming">Upcoming</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          defaultValue={sourceFilter}
          className="px-3 py-2 text-sm rounded-lg border border-border bg-background"
        >
          <option value="">All Sources</option>
          <option value="manual">Manual</option>
          <option value="conosco">Conosco</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-2xl font-bold">{events.totalDocs}</p>
          <p className="text-xs text-muted-foreground">Total Events</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-2xl font-bold">
            {events.docs.filter((e) => e.dataSource === 'conosco').length}
          </p>
          <p className="text-xs text-muted-foreground">Conosco Synced</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-2xl font-bold">
            {events.docs.filter((e) => e._status === 'published').length}
          </p>
          <p className="text-xs text-muted-foreground">Published</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-2xl font-bold">
            {events.docs.filter((e) => e.featured).length}
          </p>
          <p className="text-xs text-muted-foreground">Featured</p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left text-xs font-medium text-muted-foreground p-3">Title</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-3">Type</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-3">Source</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-3">Status</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-3">Date</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.docs.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  No events found.{' '}
                  <Link href="/admin/collections/events/create" className="text-accent hover:underline">
                    Create one
                  </Link>
                </td>
              </tr>
            ) : (
              events.docs.map((event) => (
                <tr key={event.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{event.title}</span>
                      {event.featured && (
                        <Badge variant="secondary" className="text-[10px]">Featured</Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{event.slug}</span>
                  </td>
                  <td className="p-3">
                    <span className="text-sm capitalize">{event.eventType || '—'}</span>
                  </td>
                  <td className="p-3">
                    <Badge variant={event.dataSource === 'conosco' ? 'default' : 'outline'} className="text-[10px]">
                      {event.dataSource || 'manual'}
                    </Badge>
                    {event.conoscoEventCode && (
                      <span className="block text-[10px] text-muted-foreground mt-0.5">
                        {event.conoscoEventCode}
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    <StatusBadge status={event.manualStatus as string || 'upcoming'} published={event._status === 'published'} />
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">
                    {event.startDate
                      ? new Date(event.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                      : '—'}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/admin/collections/events/${event.id}`}
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                        title="Edit in Payload"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                      <Link
                        href={`/events/${event.slug}`}
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-accent"
                        title="View live"
                        target="_blank"
                      >
                        <Calendar className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {events.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Page {events.page} of {events.totalPages} ({events.totalDocs} events)
          </p>
          <div className="flex gap-2">
            {(events.page ?? 1) > 1 && (
              <Link href={`/editor/events?page=${(events.page ?? 1) - 1}`}>
                <Button variant="outline" size="sm">Previous</Button>
              </Link>
            )}
            {events.hasNextPage && (
              <Link href={`/editor/events?page=${(events.page ?? 1) + 1}`}>
                <Button variant="outline" size="sm">Next</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status, published }: { status: string; published: boolean }) {
  const colors: Record<string, string> = {
    upcoming: 'bg-blue-100 text-blue-700',
    ongoing: 'bg-green-100 text-green-700',
    completed: 'bg-gray-100 text-gray-600',
    cancelled: 'bg-red-100 text-red-600',
  }

  return (
    <div className="flex flex-col gap-1">
      <span className={`text-[10px] px-2 py-0.5 rounded-full w-fit ${colors[status] || 'bg-muted text-muted-foreground'}`}>
        {status}
      </span>
      {!published && (
        <span className="text-[10px] text-amber-600 font-medium">Draft</span>
      )}
    </div>
  )
}
