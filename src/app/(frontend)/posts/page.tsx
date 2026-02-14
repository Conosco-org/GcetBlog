import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import Link from 'next/link'
import PageClient from './page.client'
import type { Where } from 'payload'

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
  const conditions: Where[] = [{ _status: { equals: 'published' } }]

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
    // Find the category by slug first
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

  const posts = await payload.find({
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
  })

  // Extract unique tags from all posts for "popular tags" display
  const allTagsResult = await payload.find({
    collection: 'posts',
    limit: 100,
    overrideAccess: true,
    where: { _status: { equals: 'published' } },
    select: { tags: true },
    pagination: false,
  })

  const allTags = new Set<string>()
  allTagsResult.docs.forEach((post) => {
    if (post.tags && Array.isArray(post.tags)) {
      ;(post.tags as string[]).forEach((t) => allTags.add(t))
    }
  })

  const hasActiveFilters = Boolean(query || categorySlug || tag || sort !== 'latest')

  return (
    <div className="min-h-screen">
      <PageClient />
      
      {/* Editorial Header */}
      <div className="container mx-auto px-5 sm:px-6 pt-24 pb-12 md:pt-36 md:pb-20">
        <div className="max-w-3xl animate-fade-up">
          <span className="text-[10px] sm:text-xs tracking-widest uppercase text-accent font-medium">
            {query ? 'Search Results' : categorySlug ? 'Category' : tag ? 'Tagged' : 'All Articles'}
          </span>
          <h1 className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl mt-3 sm:mt-4 mb-4 sm:mb-6 leading-[1.05]">
            {query
              ? `Results for "${query}"`
              : categorySlug
                ? categories.find((c) => c.slug === categorySlug)?.title || 'Posts'
                : tag
                  ? `#${tag}`
                  : 'Posts'}
          </h1>
          <p className="text-sm sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
            {hasActiveFilters
              ? `Showing ${posts.totalDocs} ${posts.totalDocs === 1 ? 'result' : 'results'}`
              : 'Discover insights, tutorials, creative writing, and student achievements from the GCET community.'}
          </p>
        </div>
        
        {/* Divider */}
        <div className="h-px bg-border mt-12" />
      </div>

      {/* Filters Bar */}
      <div className="container mx-auto px-5 sm:px-6 mb-8">
        <PostsFilterBar
          categories={categories}
          allTags={Array.from(allTags)}
          currentCategory={categorySlug}
          currentTag={tag}
          currentSort={sort}
          currentQuery={query}
        />
      </div>

      {/* Post Count */}
      <div className="container mx-auto px-6 mb-8">
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
        <div className="container mx-auto px-6 py-20">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">No posts found</h3>
            <p className="text-muted-foreground mb-4">
              {hasActiveFilters
                ? 'Try adjusting your search or filters.'
                : 'No posts have been published yet.'}
            </p>
            {hasActiveFilters && (
              <Link
                href="/posts"
                className="text-accent hover:underline text-sm"
              >
                Clear all filters →
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="container mx-auto px-6 pb-24">
        {posts.totalPages > 1 && posts.page && (
          <Pagination page={posts.page} totalPages={posts.totalPages} />
        )}
      </div>
    </div>
  )
}

/* Inline filter bar component (server rendered) */
function PostsFilterBar({
  categories,
  allTags,
  currentCategory,
  currentTag,
  currentSort,
  currentQuery,
}: {
  categories: Array<{ id: string; title: string; slug: string }>
  allTags: string[]
  currentCategory: string
  currentTag: string
  currentSort: string
  currentQuery: string
}) {
  function buildUrl(params: Record<string, string>) {
    const url = new URLSearchParams()
    if (currentQuery && !('q' in params)) url.set('q', currentQuery)
    if (params.q) url.set('q', params.q)
    if (params.category !== undefined) {
      if (params.category) url.set('category', params.category)
    } else if (currentCategory) {
      url.set('category', currentCategory)
    }
    if (params.tag !== undefined) {
      if (params.tag) url.set('tag', params.tag)
    } else if (currentTag) {
      url.set('tag', currentTag)
    }
    if (params.sort !== undefined) {
      if (params.sort && params.sort !== 'latest') url.set('sort', params.sort)
    } else if (currentSort && currentSort !== 'latest') {
      url.set('sort', currentSort)
    }
    const str = url.toString()
    return `/posts${str ? `?${str}` : ''}`
  }

  return (
    <div className="space-y-4">
      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/posts"
          className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
            !currentCategory && !currentTag
              ? 'bg-accent text-accent-foreground border-accent'
              : 'border-border hover:bg-muted text-muted-foreground'
          }`}
        >
          All
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={buildUrl({ category: cat.slug === currentCategory ? '' : cat.slug, tag: '' })}
            className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
              currentCategory === cat.slug
                ? 'bg-accent text-accent-foreground border-accent'
                : 'border-border hover:bg-muted text-muted-foreground'
            }`}
          >
            {cat.title}
          </Link>
        ))}
      </div>

      {/* Popular Tags */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {allTags.slice(0, 15).map((t) => (
            <Link
              key={t}
              href={buildUrl({ tag: t === currentTag ? '' : t, category: '' })}
              className={`px-2 py-1 text-[11px] rounded-md transition-colors ${
                currentTag === t
                  ? 'bg-foreground text-background'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              #{t}
            </Link>
          ))}
        </div>
      )}

      {/* Sort */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>Sort:</span>
        {[
          { label: 'Latest', value: 'latest' },
          { label: 'Most Voted', value: 'votes' },
          { label: 'Oldest', value: 'oldest' },
        ].map((opt) => (
          <Link
            key={opt.value}
            href={buildUrl({ sort: opt.value })}
            className={`px-2 py-1 rounded transition-colors ${
              currentSort === opt.value
                ? 'bg-accent text-accent-foreground'
                : 'hover:bg-muted'
            }`}
          >
            {opt.label}
          </Link>
        ))}
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `GCET Blog Posts`,
  }
}
