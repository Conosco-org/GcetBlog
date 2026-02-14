import { getPayload, type Where } from 'payload'
import configPromise from '@payload-config'
import { Upload } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/base/PageHeader'
import { MediaGridClient } from './MediaGridClient'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 24

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string; sort?: string }>
}

export default async function MediaManagerPage({ searchParams }: PageProps) {
  const params = await searchParams
  const payload = await getPayload({ config: configPromise })

  const query = params.q || ''
  const page = Math.max(1, Number(params.page) || 1)
  const sortParam = params.sort || '-createdAt'

  const where: Where | undefined = query
    ? { or: [{ filename: { like: query } }, { alt: { like: query } }] as Where[] }
    : undefined

  const allMedia = await payload.find({
    collection: 'media',
    limit: PAGE_SIZE,
    page,
    sort: sortParam,
    where,
  })

  // Compute storage from total media (separate lightweight query)
  const storageQuery = await payload.find({
    collection: 'media',
    limit: 0, // just get totalDocs
    where: {},
  })

  // Get a sample of files for storage calc (limit to recent 500)
  const storageSample = await payload.find({
    collection: 'media',
    limit: 500,
    select: { filesize: true },
  })

  const totalBytes = storageSample.docs.reduce((acc, media) => acc + (media.filesize || 0), 0)
  const storageUsed = totalBytes / (1024 * 1024 * 1024)
  const storageLimit = 10
  const storagePercent = storageUsed > 0 ? (storageUsed / storageLimit) * 100 : 0

  return (
    <div className="p-8 min-h-screen">
      <PageHeader
        title="Media Manager"
        description="Organize and manage your media files"
        action={
          <Button>
            <Upload className="w-4 h-4 mr-2" />
            Upload Files
          </Button>
        }
      />

      {/* Storage Usage */}
      <Card className="my-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Storage Usage</h2>
            <span className="text-sm font-medium text-green-600">{Math.round(storagePercent)}% Used</span>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{storageUsed.toFixed(2)} GB of {storageLimit} GB used ({storageQuery.totalDocs} files)</p>
          <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
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
      />
    </div>
  )
}
