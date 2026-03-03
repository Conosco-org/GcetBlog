import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Link from 'next/link'
import { Plus, Users2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Clubs Manager',
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

type Args = {
  searchParams: Promise<{
    q?: string
    classification?: string
    source?: string
    page?: string
  }>
}

export default async function EditorClubsPage({ searchParams: searchParamsPromise }: Args) {
  const searchParams = await searchParamsPromise
  const query = searchParams.q || ''
  const classificationFilter = searchParams.classification || ''
  const sourceFilter = searchParams.source || ''
  const page = Number(searchParams.page || '1')

  const payload = await getPayload({ config: configPromise })

  const conditions: Record<string, unknown>[] = []
  if (query) {
    conditions.push({ title: { like: query } })
  }
  if (classificationFilter) {
    conditions.push({ classification: { equals: classificationFilter } })
  }
  if (sourceFilter) {
    conditions.push({ dataSource: { equals: sourceFilter } })
  }

  const clubs = await payload.find({
    collection: 'clubs',
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
              <Users2 className="h-7 w-7" />
              Clubs Manager
            </h1>
            <p className="text-muted-foreground">Manage clubs and student chapters</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/editor/clubs/sync-preview">
              <Button variant="outline" size="sm">
                Sync Preview
              </Button>
            </Link>
            <Link href="/admin/collections/clubs/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Club
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <input
          type="text"
          placeholder="Search clubs..."
          defaultValue={query}
          className="px-3 py-2 text-sm rounded-lg border border-border bg-background w-64"
        />
        <select
          defaultValue={classificationFilter}
          className="px-3 py-2 text-sm rounded-lg border border-border bg-background"
        >
          <option value="">All Types</option>
          <option value="technical">Technical</option>
          <option value="cultural">Cultural</option>
          <option value="sports">Sports</option>
          <option value="literary">Literary</option>
          <option value="social">Social</option>
          <option value="professional">Professional</option>
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
          <p className="text-2xl font-bold">{clubs.totalDocs}</p>
          <p className="text-xs text-muted-foreground">Total Clubs</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-2xl font-bold">
            {clubs.docs.filter((c) => c.dataSource === 'conosco').length}
          </p>
          <p className="text-xs text-muted-foreground">Conosco Synced</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-2xl font-bold">
            {clubs.docs.filter((c) => c._status === 'published').length}
          </p>
          <p className="text-xs text-muted-foreground">Published</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-2xl font-bold">
            {clubs.docs.filter((c) => c.featured).length}
          </p>
          <p className="text-xs text-muted-foreground">Featured</p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left text-xs font-medium text-muted-foreground p-3">Club Name</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-3">Classification</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-3">Source</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-3">Status</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-3">Department</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clubs.docs.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  No clubs found.{' '}
                  <Link href="/admin/collections/clubs/create" className="text-accent hover:underline">
                    Create one
                  </Link>
                </td>
              </tr>
            ) : (
              clubs.docs.map((club) => (
                <tr key={club.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{club.title}</span>
                      {club.featured && (
                        <Badge variant="secondary" className="text-[10px]">Featured</Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{club.slug}</span>
                  </td>
                  <td className="p-3 text-sm capitalize">{club.classification || '—'}</td>
                  <td className="p-3">
                    <Badge variant={club.dataSource === 'conosco' ? 'default' : 'outline'} className="text-[10px]">
                      {club.dataSource || 'manual'}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-col gap-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full w-fit ${
                        club.manualStatus === 'active' || !club.manualStatus
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {club.manualStatus || 'active'}
                      </span>
                      {club._status !== 'published' && (
                        <span className="text-[10px] text-amber-600 font-medium">Draft</span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">{club.department || '—'}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/admin/collections/clubs/${club.id}`}
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                        title="Edit in Payload"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                      <Link
                        href={`/clubs/${club.slug}`}
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-accent"
                        title="View live"
                        target="_blank"
                      >
                        <Users2 className="h-3.5 w-3.5" />
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
      {clubs.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Page {clubs.page} of {clubs.totalPages} ({clubs.totalDocs} clubs)
          </p>
          <div className="flex gap-2">
            {(clubs.page ?? 1) > 1 && (
              <Link href={`/editor/clubs?page=${(clubs.page ?? 1) - 1}`}>
                <Button variant="outline" size="sm">Previous</Button>
              </Link>
            )}
            {clubs.hasNextPage && (
              <Link href={`/editor/clubs?page=${(clubs.page ?? 1) + 1}`}>
                <Button variant="outline" size="sm">Next</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
