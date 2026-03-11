import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Link from 'next/link'
import { Plus, FileStack, ExternalLink, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pages Manager | Dashboard',
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

type Args = {
  searchParams: Promise<{
    q?: string
    status?: string
    linked?: string
    page?: string
  }>
}

export default async function PagesManagerPage({ searchParams: searchParamsPromise }: Args) {
  const searchParams = await searchParamsPromise
  const query = searchParams.q || ''
  const statusFilter = searchParams.status || ''
  const linkedFilter = searchParams.linked || ''
  const page = Number(searchParams.page || '1')

  const payload = await getPayload({ config: configPromise })

  const conditions: Record<string, unknown>[] = []
  if (query) {
    conditions.push({ title: { like: query } })
  }
  if (statusFilter) {
    conditions.push({ _status: { equals: statusFilter } })
  }
  if (linkedFilter === 'yes') {
    conditions.push({ club: { exists: true } })
  } else if (linkedFilter === 'no') {
    conditions.push({ club: { exists: false } })
  }

  const pages = await payload.find({
    collection: 'pages',
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
              <Layers className="h-7 w-7" />
              Pages Manager
            </h1>
            <p className="text-muted-foreground">Create and manage landing pages &amp; custom pages</p>
          </div>
          <Link href="/user/pages/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Page
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <form className="flex flex-wrap items-center gap-2 mb-6">
        <input
          type="text"
          name="q"
          placeholder="Search pages..."
          defaultValue={query}
          className="px-3 py-2 text-sm rounded-lg border border-border bg-background w-64"
        />
        <select
          name="status"
          defaultValue={statusFilter}
          className="px-3 py-2 text-sm rounded-lg border border-border bg-background"
        >
          <option value="">All Statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <select
          name="linked"
          defaultValue={linkedFilter}
          className="px-3 py-2 text-sm rounded-lg border border-border bg-background"
        >
          <option value="">All Pages</option>
          <option value="yes">Club Landing Pages</option>
          <option value="no">Standalone Pages</option>
        </select>
        <Button type="submit" variant="outline" size="sm">
          Filter
        </Button>
      </form>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-2xl font-bold">{pages.totalDocs}</p>
          <p className="text-xs text-muted-foreground">Total Pages</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-2xl font-bold">
            {pages.docs.filter((p) => p._status === 'published').length}
          </p>
          <p className="text-xs text-muted-foreground">Published</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-2xl font-bold">
            {pages.docs.filter((p) => p.club).length}
          </p>
          <p className="text-xs text-muted-foreground">Club Landing Pages</p>
        </div>
      </div>

      {/* Pages list */}
      {pages.docs.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-border bg-card/50 p-12 text-center">
          <FileStack className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-semibold mb-1">No pages yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create your first page — add a club landing page or a standalone page.
          </p>
          <Link href="/user/pages/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Page
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {pages.docs.map((doc) => {
            const club = doc.club && typeof doc.club === 'object' ? doc.club : null
            const blockCount = Array.isArray(doc.layout) ? doc.layout.length : 0
            const heroType = doc.hero && typeof doc.hero === 'object' && 'type' in doc.hero
              ? (doc.hero as { type?: string }).type
              : 'none'

            return (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-accent/30 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">{doc.title || 'Untitled'}</h3>
                    <Badge variant={doc._status === 'published' ? 'default' : 'secondary'}>
                      {doc._status === 'published' ? 'Published' : 'Draft'}
                    </Badge>
                    {club && (
                      <Badge variant="outline" className="text-xs">
                        🏢 {(club as { title?: string }).title || 'Club'}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>/{doc.slug}</span>
                    <span className="text-border">·</span>
                    <span>Hero: {heroType || 'none'}</span>
                    <span className="text-border">·</span>
                    <span>{blockCount} block{blockCount !== 1 ? 's' : ''}</span>
                    {doc.updatedAt && (
                      <>
                        <span className="text-border">·</span>
                        <span>Updated {new Date(doc.updatedAt).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {doc.slug && (
                    <Link
                      href={club ? `/clubs/${(club as { slug?: string }).slug || ''}` : `/${doc.slug}`}
                      target="_blank"
                    >
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                  <Link href={`/user/pages/${doc.id}/edit`}>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {pages.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: pages.totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/user/pages?page=${p}${query ? `&q=${query}` : ''}${statusFilter ? `&status=${statusFilter}` : ''}${linkedFilter ? `&linked=${linkedFilter}` : ''}`}
            >
              <Button
                variant={p === page ? 'default' : 'outline'}
                size="sm"
              >
                {p}
              </Button>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
