import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import type { User } from '@/payload-types'
import { checkPermission } from '@/access/hasPermission'
import CategoryManager from './CategoryManager'

// Force dynamic rendering for real-time data
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function CategoriesPage() {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) {
    redirect('/login')
  }

  const typedUser = user as User

  if (!checkPermission(user, 'blog:publish')) {
    redirect('/user')
  }

  // Fetch categories with post counts
  const categories = await payload.find({
    collection: 'categories',
    limit: 100,
    sort: 'title',
  })

  // Get post counts for each category
  const categoryStats = await Promise.all(
    categories.docs.map(async (category) => {
      const posts = await payload.find({
        collection: 'posts',
        where: {
          categories: { equals: category.id },
        },
        limit: 0, // Just get count
      })
      return {
        ...category,
        postCount: posts.totalDocs,
      }
    })
  )

  return (
    <div className="p-8 min-h-screen">
      <CategoryManager 
        categories={categoryStats} 
        totalCategories={categories.totalDocs}
      />
    </div>
  )
}