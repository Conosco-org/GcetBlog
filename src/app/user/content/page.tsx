import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ContentManagerClient from './ContentManagerClient'

// Force dynamic rendering for real-time data
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ContentManagerPage() {
  const payload = await getPayload({ config: configPromise })

  // Get all posts with proper pagination
  const posts = await payload.find({
    collection: 'posts',
    depth: 2, // Populate relationships
    limit: 20,
    sort: '-updatedAt',
  })

  // Get all categories for the filter dropdown
  const categories = await payload.find({
    collection: 'categories',
    limit: 100,
    sort: 'title',
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
          <Link href="/user/posts/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </Button>
          </Link>
        </div>
      </div>

      <ContentManagerClient posts={posts} categories={categories} />
    </div>
  )
}
