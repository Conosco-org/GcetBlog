import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/post/CollectionArchive'
import { PageRange } from '@/components/shared/PageRange'
import { Pagination } from '@/components/shared/Pagination'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import PageClient from './page.client'
import { notFound } from 'next/navigation'

export const revalidate = 600

type Args = {
  params: Promise<{
    pageNumber: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { pageNumber } = await paramsPromise
  const payload = await getPayload({ config: configPromise })

  const sanitizedPageNumber = Number(pageNumber)

  if (!Number.isInteger(sanitizedPageNumber)) notFound()

  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 12,
    page: sanitizedPageNumber,
    overrideAccess: false,
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
        <div className="h-px bg-border mt-12" />
      </div>

      <div className="container mx-auto px-6 mb-8">
        <PageRange
          collection="posts"
          currentPage={posts.page}
          limit={12}
          totalDocs={posts.totalDocs}
        />
      </div>

      <CollectionArchive posts={posts.docs} />

      <div className="container mx-auto px-6 pb-24">
        {posts?.page && posts?.totalPages > 1 && (
          <Pagination page={posts.page} totalPages={posts.totalPages} />
        )}
      </div>
    </div>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { pageNumber } = await paramsPromise
  const currentPage = Number(pageNumber || '1')

  return {
    title: `GCET Blog Posts Page ${pageNumber || ''}`,
    alternates: {
      canonical: currentPage <= 1 ? '/posts' : `/posts/page/${currentPage}`,
    },
  }
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const { totalDocs } = await payload.count({
    collection: 'posts',
    overrideAccess: false,
  })

  const totalPages = Math.ceil(totalDocs / 10)

  const pages: { pageNumber: string }[] = []

  for (let i = 1; i <= totalPages; i++) {
    pages.push({ pageNumber: String(i) })
  }

  return pages
}
