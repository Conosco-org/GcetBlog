import { getPayload, type Where } from 'payload'
import configPromise from '@payload-config'
import { Card, CardContent } from '@/frontend/components/ui/card'
import { PageHeader } from '@frontend/components/base/PageHeader'
import { MediaGridClient } from './MediaGridClient'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 24

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string; sort?: string; user?: string }>
}

export default async function MediaManagerPage({ searchParams }: PageProps) {
  const params = await searchParams
  const payload = await getPayload({ config: configPromise })

  const query = params.q || ''
  const page = Math.max(1, Number(params.page) || 1)
  const sortParam = params.sort || '-createdAt'
  const userFilter = params.user || ''

  const where: Where = {
    and: [
      query ? { or: [{ filename: { like: query } }, { alt: { like: query } }] as Where[] } : {},
      userFilter ? { uploadedBy: { equals: userFilter } } : {},
    ].filter((condition) => Object.keys(condition).length > 0),
  }

  const [allMedia, storageCount, storageSample, allUsers] = await Promise.all([
    payload.find({
      collection: 'media',
      limit: PAGE_SIZE,
      page,
      sort: sortParam,
      where: Object.keys(where).length > 0 ? where : undefined,
    }),
    // count() is a single DB aggregation - no docs loaded
    payload.count({ collection: 'media' }),
    // Sample recent files for storage estimate
    payload.find({
      collection: 'media',
      limit: 500,
      select: { filesize: true },
      depth: 0,
    }),
    // Get all users for filter dropdown
    payload.find({
      collection: 'users',
      limit: 1000,
      sort: 'name',
      select: { name: true, email: true },
    }),
  ])

  const totalBytes = storageSample.docs.reduce((acc, media) => acc + (media.filesize || 0), 0)
  const storageUsed = totalBytes / (1024 * 1024 * 1024)
  const storageLimit = 10
  const storagePercent = storageUsed > 0 ? (storageUsed / storageLimit) * 100 : 0

  return (
    <div className="p-8 min-h-screen">
      <PageHeader
        title="Media Manager"
        description="Organize and manage your media files"
      />

      {/* Storage Usage */}
      <Card className="my-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Storage Usage</h2>
            <span className="text-sm font-medium text-green-600">{Math.round(storagePercent)}% Used</span>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{storageUsed.toFixed(2)} GB of {storageLimit} GB used ({storageCount.totalDocs} files)</p>
          <div className="w-full bg-secondary rounded-full h-3 overflow-hidden" aria-hidden="true">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all"
              style={{ width: `${Math.min(storagePercent, 100)}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Media Grid with search + pagination */}
      <MediaGridClient
        media={allMedia.docs}
        totalPages={allMedia.totalPages}
        currentPage={allMedia.page || page}
        totalItems={allMedia.totalDocs}
        pageSize={PAGE_SIZE}
        query={query}
        sortParam={sortParam}
        users={allUsers.docs}
        userFilter={userFilter}
      />
    </div>
  )
}
