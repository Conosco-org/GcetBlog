import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Link from 'next/link'
import { RefreshCw, CheckCircle2, AlertCircle, Clock, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getConoscoService } from '@/services/conosco'
import { getCachedClubs, getCachedClubStats } from '@/services/conosco/cached'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Club Sync Preview',
}

export const dynamic = 'force-dynamic'

export default async function ClubSyncPreviewPage() {
  const payload = await getPayload({ config: configPromise })
  const { isConnected } = getConoscoService()

  const cmsClubs = await payload.find({
    collection: 'clubs',
    where: { dataSource: { equals: 'conosco' } },
    limit: 100,
    sort: '-updatedAt',
    depth: 0,
  })

  let conoscoClubs: Array<{ clubCode: string; title: string; status: string; classification: string }> = []
  let stats: { total?: number; active?: number } = {}
  let apiError: string | null = null

  if (isConnected) {
    try {
      const [clubsResponse, statsResponse] = await Promise.all([
        getCachedClubs({ limit: 100 }),
        getCachedClubStats(),
      ])
      conoscoClubs = clubsResponse.data.map((c) => ({
        clubCode: c.clubCode,
        title: c.name,
        status: c.status,
        classification: c.classification,
      }))
      stats = {
        total: statsResponse.data.total,
        active: statsResponse.data.active,
      }
    } catch (err) {
      apiError = err instanceof Error ? err.message : 'Failed to fetch from Conosco'
    }
  }

  const linkedCodes = new Set(cmsClubs.docs.map((c) => c.conoscoClubCode).filter(Boolean))
  const unlinkedClubs = conoscoClubs.filter((c) => !linkedCodes.has(c.clubCode))

  return (
    <div className="p-8 min-h-screen max-w-4xl">
      <div className="mb-8">
        <Link
          href="/editor/clubs"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Clubs
        </Link>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <RefreshCw className="h-7 w-7" />
          Club Sync Preview
        </h1>
        <p className="text-muted-foreground mt-1">
          Preview Conosco club data and check for unlinked clubs
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
        {apiError && <p className="text-sm text-red-600 mt-2">{apiError}</p>}
      </div>

      {/* Stats */}
      {isConnected && !apiError && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-2xl font-bold">{stats.total ?? '—'}</p>
            <p className="text-xs text-muted-foreground">Total in Conosco</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-2xl font-bold text-green-600">{stats.active ?? '—'}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </div>
        </div>
      )}

      {/* Linked Clubs */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3">
          Linked Clubs ({cmsClubs.docs.length})
        </h2>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {cmsClubs.docs.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-sm">
              No clubs linked to Conosco yet.
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left text-xs font-medium text-muted-foreground p-3">CMS Title</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-3">Club Code</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-3">Last Synced</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {cmsClubs.docs.map((club) => (
                  <tr key={club.id} className="border-b border-border last:border-0">
                    <td className="p-3 text-sm font-medium">{club.title}</td>
                    <td className="p-3">
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                        {club.conoscoClubCode || '—'}
                      </code>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">
                      {club.lastSyncedAt
                        ? new Date(club.lastSyncedAt).toLocaleString('en-IN')
                        : 'Never'}
                    </td>
                    <td className="p-3">
                      <Badge variant={club._status === 'published' ? 'default' : 'outline'} className="text-[10px]">
                        {club._status || 'draft'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Unlinked Clubs */}
      {isConnected && unlinkedClubs.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" />
            Unlinked Conosco Clubs ({unlinkedClubs.length})
          </h2>
          <p className="text-sm text-muted-foreground mb-3">
            These clubs exist in Conosco but have no CMS entry.
          </p>
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 dark:bg-amber-900/5 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-amber-200">
                  <th className="text-left text-xs font-medium text-muted-foreground p-3">Club Name</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-3">Code</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-3">Classification</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-3">Status</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {unlinkedClubs.map((club) => (
                  <tr key={club.clubCode} className="border-b border-amber-200 last:border-0">
                    <td className="p-3 text-sm font-medium">{club.title}</td>
                    <td className="p-3">
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{club.clubCode}</code>
                    </td>
                    <td className="p-3 text-sm capitalize">{club.classification}</td>
                    <td className="p-3 text-xs capitalize">{club.status}</td>
                    <td className="p-3">
                      <Link href={`/admin/collections/clubs/create?conoscoClubCode=${club.clubCode}&dataSource=conosco`}>
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
