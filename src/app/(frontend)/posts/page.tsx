import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import PageClient from './page.client'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function Page() {
  const payload = await getPayload({ config: configPromise })

  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 12,
    overrideAccess: true,
    where: {
      _status: {
        equals: 'published',
      },
    },
    sort: '-updatedAt',
    select: {
      title: true,
      slug: true,
      categories: true,
      meta: true,
      heroImage: true,
    },
  })

  return (
    <div className="min-h-screen">
      <PageClient />
      
      {/* Editorial Header */}
      <div className="container mx-auto px-5 sm:px-6 pt-24 pb-12 md:pt-36 md:pb-20">
        <div className="max-w-3xl animate-fade-up">
          <span className="text-[10px] sm:text-xs tracking-widest uppercase text-accent font-medium">All Articles</span>
          <h1 className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl mt-3 sm:mt-4 mb-4 sm:mb-6 leading-[1.05]">
            Posts
          </h1>
          <p className="text-sm sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
            Discover insights, tutorials, creative writing, and student achievements from the GCET community.
          </p>
        </div>
        
        {/* Divider */}
        <div className="h-px bg-border mt-12" />
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
      <CollectionArchive posts={posts.docs} />

      {/* Pagination */}
      <div className="container mx-auto px-6 pb-24">
        {posts.totalPages > 1 && posts.page && (
          <Pagination page={posts.page} totalPages={posts.totalPages} />
        )}
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `GCET Blog Posts`,
  }
}
