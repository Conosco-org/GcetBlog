import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React, { Suspense } from 'react'
import Link from 'next/link'
import { unstable_cache } from 'next/cache'
import PageClient from './page.client'
import { PostsFilterBar } from './PostsFilterBar'
import { NewsletterSignup } from '@/components/NewsletterSignup'
import type { Where } from 'payload'
import { publishedVisibilityWhere } from '@/utilities/postValidation'

// Cache popular tags for 10 minutes - they rarely change
const getCachedPopularTags = unstable_cache(
  async () => {
    const payload = await getPayload({ config: configPromise })
    const publishVisibility = publishedVisibilityWhere()
    const result = await payload.find({
      collection: 'posts',
      limit: 100,
      overrideAccess: true,
      where: { and: [{ _status: { equals: 'published' } }, publishVisibility] },
      select: { tags: true },
      pagination: false,
    })
    const allTags = new Set<string>()
    result.docs.forEach((post) => {
      if (post.tags && Array.isArray(post.tags)) {
        ;(post.tags as string[]).forEach((t) => allTags.add(t))
      }
    })
    return Array.from(allTags)
  },
  ['popular-tags'],
  { revalidate: 600, tags: ['posts'] },
)

export const dynamic = 'force-dynamic'

type Args = {
  searchParams: Promise<{
    q?: string
    category?: string
    tag?: string
    sort?: string
    page?: string
  }>
}

export default async function Page({ searchParams: searchParamsPromise }: Args) {
  const searchParams = await searchParamsPromise
  const query = searchParams.q || ''
  const categorySlug = searchParams.category || ''
  const tag = searchParams.tag || ''
  const sort = searchParams.sort || 'latest'
  const pageNumber = Number(searchParams.page || '1')
  const publishVisibility = publishedVisibilityWhere()

  const payload = await getPayload({ config: configPromise })

  // Fetch categories for the filter UI
  const categoriesResult = await payload.find({
    collection: 'categories',
    limit: 50,
    sort: 'title',
    select: { title: true, slug: true },
  })

  const categories = categoriesResult.docs.map((doc) => ({
    id: String(doc.id),
    title: doc.title || '',
    slug: doc.slug || '',
  }))

  // Build where clause
  const conditions: Where[] = [{ _status: { equals: 'published' } }, publishVisibility]

  // Search query
  if (query) {
    conditions.push({
      or: [
        { title: { like: query } },
        { 'meta.description': { like: query } },
        { 'meta.title': { like: query } },
      ],
    })
  }

  // Category filter
  if (categorySlug) {
    const category = await payload.find({
      collection: 'categories',
      where: { slug: { equals: categorySlug } },
      limit: 1,
      depth: 0,
    })
    if (category.docs.length > 0) {
      conditions.push({
        categories: { contains: category.docs[0]!.id },
      })
    }
  }

  // Tag filter
  if (tag) {
    conditions.push({
      tags: { like: tag },
    })
  }

  // Build sort string
  let sortField: string
  switch (sort) {
    case 'votes':
      sortField = '-voteScore'
      break
    case 'oldest':
      sortField = 'publishedAt'
      break
    case 'latest':
    default:
      sortField = '-publishedAt'
  }

  const [posts, popularTags] = await Promise.all([
    payload.find({
      collection: 'posts',
      depth: 1,
      limit: 12,
      page: pageNumber,
      overrideAccess: true,
      where: { and: conditions },
      sort: sortField,
      select: {
        title: true,
        slug: true,
        categories: true,
        meta: true,
        heroImage: true,
        tags: true,
        voteScore: true,
      },
    }),
    getCachedPopularTags(),
  ])

  const allTags = popularTags
  const hasActiveFilters = Boolean(query || categorySlug || tag || sort !== 'latest')

  return (
    <div className="min-h-screen">
      <PageClient />

      {/* Compact Header */}
      <div className="container mx-auto px-5 sm:px-6 pt-20 pb-4 md:pt-24 md:pb-6">
        <div className="max-w-3xl">
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl mb-2 leading-tight">
            {query
              ? `Results for "${query}"`
              : categorySlug
                ? categories.find((c) => c.slug === categorySlug)?.title || 'Posts'
                : tag
                  ? `#${tag}`
                  : 'Posts'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {hasActiveFilters
              ? `${posts.totalDocs} ${posts.totalDocs === 1 ? 'result' : 'results'}`
              : 'Insights, tutorials, and stories from the GCET community.'}
          </p>
        </div>
      </div>

      {/* Filters Bar (client-side for instant interaction) */}
      <div className="container mx-auto px-5 sm:px-6 mb-4">
        <Suspense fallback={null}>
          <PostsFilterBar
            categories={categories}
            allTags={Array.from(allTags)}
          />
        </Suspense>
      </div>

      {/* Post Count */}
      <div className="container mx-auto px-5 sm:px-6 mb-4">
        <PageRange
          collection="posts"
          currentPage={posts.page}
          limit={12}
          totalDocs={posts.totalDocs}
        />
      </div>

      {/* Posts Grid */}
      {posts.totalDocs > 0 ? (
        <CollectionArchive posts={posts.docs} />
      ) : (
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">No posts found</h3>
            <p className="text-muted-foreground text-sm mb-3">
              {hasActiveFilters
                ? 'Try adjusting your search or filters.'
                : 'No posts have been published yet.'}
            </p>
            {hasActiveFilters && (
              <Link
                href="/posts"
                className="text-accent hover:underline text-sm"
              >
                Clear all filters
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Newsletter signup banner */}
      <div className="container mx-auto px-5 sm:px-6 py-10">
        <div className="rounded-2xl bg-accent/5 dark:bg-accent/10 border border-accent/20 px-6 py-8 sm:px-10 flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="flex-1">
            <h3 className="text-lg font-semibold leading-snug">Never miss a post</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Subscribe to get new articles from GCET students directly in your inbox.
            </p>
          </div>
          <div className="sm:w-80 shrink-0">
            <NewsletterSignup variant="inline" />
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="container mx-auto px-5 sm:px-6 pb-12">
        {posts.totalPages > 1 && posts.page && (
          <Pagination page={posts.page} totalPages={posts.totalPages} />
        )}
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: 'Posts',
    description: 'Browse all posts from the GCET Blog community.',
  }
}
