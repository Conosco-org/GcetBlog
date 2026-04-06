import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { ContentManagerTabs } from './ContentManagerTabs'

// Force dynamic rendering for real-time data
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface PageProps {
  searchParams: Promise<{ tab?: string }>
}

export default async function ContentManagerPage({ searchParams }: PageProps) {
  const params = await searchParams
  const payload = await getPayload({ config: configPromise })
  const activeTab = params.tab || 'posts'

  // Get all posts with proper pagination
  const posts = await payload.find({
    collection: 'posts',
    depth: 2,
    limit: 20,
    sort: '-updatedAt',
  })

  // Get all categories for the filter dropdown
  const categories = await payload.find({
    collection: 'categories',
    limit: 100,
    sort: 'title',
  })

  // Get all comments
  const comments = await payload.find({
    collection: 'comments',
    depth: 2,
    limit: 100,
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
        comments={comments.docs}
      />
    </div>
  )
}
