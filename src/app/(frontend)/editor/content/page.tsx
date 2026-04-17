import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { ContentManagerTabs } from './ContentManagerTabs'

// Force dynamic rendering for real-time data
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface PageProps {
  searchParams: Promise<{ tab?: string; page?: string; limit?: string }>
}

export default async function ContentManagerPage({ searchParams }: PageProps) {
  const params = await searchParams
  const payload = await getPayload({ config: configPromise })
  const activeTab = params.tab || 'posts'
  const page = parseInt(params.page || '1', 10)
  const limit = parseInt(params.limit || '10', 10)

  // Get only published posts
  const posts = await payload.find({
    collection: 'posts',
    where: {
      _status: { equals: 'published' },
    },
    depth: 2,
    page,
    limit,
    sort: '-updatedAt',
  })

  // Get all categories for the filter dropdown
  const categories = await payload.find({
    collection: 'categories',
    limit: 100,
    sort: 'title',
  })

  // Get only approved comments
  const comments = await payload.find({
    collection: 'comments',
    where: {
      status: { equals: 'approved' },
    },
    depth: 2,
    page,
    limit,
    sort: '-createdAt',
  })

  return (
    <div className="p-8 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold">Content Manager</h1>
            <p className="text-muted-foreground">Manage and organize all blog content</p>
          </div>
        </div>
      </div>

      <ContentManagerTabs
        activeTab={activeTab}
        posts={posts}
        categories={categories}
        comments={comments}
      />
    </div>
  )
}
