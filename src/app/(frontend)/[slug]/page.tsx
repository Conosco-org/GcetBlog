import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload, type RequiredDataFromCollectionSlug } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import { homeStatic } from '@/endpoints/seed/home-static'

export const dynamic = 'force-dynamic'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { HeroSection, HomePosts, FeaturedPosts, FeaturesSection, CTASection } from '@/components/LandingPage'
import { publishedVisibilityWhere } from '@/utilities/postValidation'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const pages = await payload.find({
    collection: 'pages',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  const params = pages.docs
    ?.filter((doc) => {
      return doc.slug !== 'home'
    })
    .map(({ slug }) => {
      return { slug }
    })

  return params
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = 'home' } = await paramsPromise
  const url = '/' + slug

  let page: RequiredDataFromCollectionSlug<'pages'> | null

  page = await queryPageBySlug({
    slug,
  })

  // Remove this code once your website is seeded
  if (!page && slug === 'home') {
    page = homeStatic
  }

  if (!page) {
    return <PayloadRedirects url={url} />
  }

  // Modern landing page for home - show latest 10 posts
  if (slug === 'home') {
    const payload = await getPayload({ config: configPromise })
    const now = new Date().toISOString()
    const publishVisibility = publishedVisibilityWhere()

    const featuredResult = await payload.find({
      collection: 'posts',
      depth: 2,
      limit: 6,
      overrideAccess: true,
      sort: '-featuredFrom',
      where: {
        and: [
          { _status: { equals: 'published' } },
          publishVisibility,
          { featuredFrom: { less_than_equal: now } },
          { featuredUntil: { greater_than_equal: now } },
        ],
      },
    })

    const featuredIDs = featuredResult.docs.map((doc) => doc.id)
    
    // Fetch latest 10 published posts, sorted by publish date
    const postsResult = await payload.find({
      collection: 'posts',
      depth: 2,
      limit: 10,
      overrideAccess: true,
      where: {
        and: [
          { _status: { equals: 'published' } },
          publishVisibility,
          ...(featuredIDs.length > 0 ? [{ id: { not_in: featuredIDs } }] : []),
        ],
      },
      sort: '-publishedAt',
    })

    // Get total counts for stats
    const totalPosts = await payload.count({
      collection: 'posts',
      where: {
        and: [{ _status: { equals: 'published' } }, publishVisibility],
      },
    })

    const totalUsers = await payload.count({
      collection: 'users',
    })

    // Get latest post for the floating card
    const latestPost = postsResult.docs[0]

    return (
      <main className="min-h-screen" data-hide-footer="true">
        <PageClient />
        <PayloadRedirects disableNotFound url={url} />
        {draft && <LivePreviewListener />}
        
        <HeroSection 
          totalPosts={totalPosts.totalDocs} 
          totalUsers={totalUsers.totalDocs}
          latestPost={latestPost}
        />
        <FeaturedPosts posts={featuredResult.docs} />
        <HomePosts posts={postsResult.docs} />
        <FeaturesSection />
        <CTASection />
      </main>
    )
  }

  const { hero, layout } = page

  return (
    <article className="pt-16 pb-24">
      <PageClient />
      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <RenderHero {...hero} />
      <RenderBlocks blocks={layout} />
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = 'home' } = await paramsPromise
  const page = await queryPageBySlug({
    slug,
  })

  return generateMeta({ doc: page })
}

const queryPageBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'pages',
    draft,
    limit: 1,
    pagination: false,
    overrideAccess: draft,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})

