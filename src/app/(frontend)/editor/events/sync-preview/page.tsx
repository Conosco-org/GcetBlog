import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Link from 'next/link'
import { RefreshCw, CheckCircle2, AlertCircle, Clock, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getConoscoService } from '@/services/conosco'
import { getCachedEvents, getCachedEventStats } from '@/services/conosco/cached'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Event Sync Preview',
}

export const dynamic = 'force-dynamic'

export default async function EventSyncPreviewPage() {
  const payload = await getPayload({ config: configPromise })
  const { isConnected } = getConoscoService()

  // Get CMS events linked to Conosco
  const cmsEvents = await payload.find({
    collection: 'events',
    where: { dataSource: { equals: 'conosco' } },
    limit: 100,
    sort: '-updatedAt',
    depth: 0,
  })

  // Try fetching from Conosco
  let conoscoEvents: Array<{ eventCode: string; title: string; status: string; startDate: string }> = []
  let stats: { total?: number; upcoming?: number; ongoing?: number; completed?: number } = {}
  let apiError: string | null = null

  if (isConnected) {
    try {
      const [eventsResponse, statsResponse] = await Promise.all([
        getCachedEvents({ limit: 100 }),
        getCachedEventStats(),
      ])
      conoscoEvents = eventsResponse.data.map((e) => ({
        eventCode: e.eventCode,
        title: e.title,
        status: e.status,
        startDate: e.startDate,
      }))
      stats = {
        total: statsResponse.data.total,
        upcoming: statsResponse.data.upcoming,
        ongoing: statsResponse.data.ongoing,
        completed: statsResponse.data.completed,
      }
    } catch (err) {
      apiError = err instanceof Error ? err.message : 'Failed to fetch from Conosco'
    }
  }

  // Find unlinked Conosco events (exist in API but not in CMS)
  const linkedCodes = new Set(cmsEvents.docs.map((e) => e.conoscoEventCode).filter(Boolean))
  const unlinkedEvents = conoscoEvents.filter((e) => !linkedCodes.has(e.eventCode))

  return (
    <div className="p-8 min-h-screen max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/editor/events"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Events
        </Link>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <RefreshCw className="h-7 w-7" />
          Event Sync Preview
        </h1>
        <p className="text-muted-foreground mt-1">
          Preview Conosco event data and check for unlinked events
        </p>
      </div>

      {/* Connection Status */}
      <div className={`rounded-xl border p-4 mb-6 ${isConnected ? 'border-green-200 bg-green-50 dark:bg-green-900/10' : 'border-amber-200 bg-amber-50 dark:bg-amber-900/10'}`}>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <AlertCircle className="h-5 w-5 text-amber-600" />
          )}
          <span className="font-medium text-sm">
            {isConnected ? 'Connected to Conosco API' : 'Conosco API not configured'}
          </span>
        </div>
        {apiError && (
          <p className="text-sm text-red-600 mt-2">{apiError}</p>
        )}
      </div>

      {/* Stats from Conosco */}
      {isConnected && !apiError && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-2xl font-bold">{stats.total ?? '—'}</p>
            <p className="text-xs text-muted-foreground">Total in Conosco</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-2xl font-bold text-blue-600">{stats.upcoming ?? '—'}</p>
            <p className="text-xs text-muted-foreground">Upcoming</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-2xl font-bold text-green-600">{stats.ongoing ?? '—'}</p>
            <p className="text-xs text-muted-foreground">Ongoing</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-2xl font-bold text-gray-500">{stats.completed ?? '—'}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
        </div>
      )}

      {/* Linked Events */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3">
          Linked Events ({cmsEvents.docs.length})
        </h2>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {cmsEvents.docs.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-sm">
              No events linked to Conosco yet.
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left text-xs font-medium text-muted-foreground p-3">CMS Title</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-3">Event Code</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-3">Last Synced</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {cmsEvents.docs.map((event) => (
                  <tr key={event.id} className="border-b border-border last:border-0">
                    <td className="p-3 text-sm font-medium">{event.title}</td>
                    <td className="p-3">
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                        {event.conoscoEventCode || '—'}
                      </code>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">
                      {event.lastSyncedAt
                        ? new Date(event.lastSyncedAt).toLocaleString('en-IN')
                        : 'Never'}
                    </td>
                    <td className="p-3">
                      <Badge variant={event._status === 'published' ? 'default' : 'outline'} className="text-[10px]">
                        {event._status || 'draft'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Unlinked Events from Conosco */}
      {isConnected && unlinkedEvents.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" />
            Unlinked Conosco Events ({unlinkedEvents.length})
          </h2>
          <p className="text-sm text-muted-foreground mb-3">
            These events exist in Conosco but have no CMS entry. Create one to add editorial content.
          </p>
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 dark:bg-amber-900/5 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-amber-200">
                  <th className="text-left text-xs font-medium text-muted-foreground p-3">Event Title</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-3">Code</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-3">Status</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-3">Date</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {unlinkedEvents.map((event) => (
                  <tr key={event.eventCode} className="border-b border-amber-200 last:border-0">
                    <td className="p-3 text-sm font-medium">{event.title}</td>
                    <td className="p-3">
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{event.eventCode}</code>
                    </td>
                    <td className="p-3">
                      <span className="text-xs capitalize">{event.status}</span>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">
                      {new Date(event.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="p-3">
                      <Link href={`/admin/collections/events/create?conoscoEventCode=${event.eventCode}&dataSource=conosco`}>
                        <Button variant="outline" size="sm" className="text-xs">
                          Link
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
