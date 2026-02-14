import React from 'react'
import type { Metadata } from 'next'
import {
  HeroSection,
  HomePosts,
  FeaturedPosts,
  FeaturesSection,
  CTASection,
} from '@/components/LandingPage'
import { getPayload } from 'payload'
import config from '@payload-config'

export const metadata: Metadata = {
  title: 'Home',
}

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const payload = await getPayload({ config })
  
  const now = new Date().toISOString()

  // Fetch featured posts (within featured date range)
  const featuredData = await payload.find({
    collection: 'posts',
    limit: 6,
    sort: '-featuredFrom',
    depth: 1,
    where: {
      and: [
        { _status: { equals: 'published' } },
        { featuredFrom: { less_than_equal: now } },
        { featuredUntil: { greater_than_equal: now } },
      ],
    },
  })

  // Fetch latest published posts (excluding already featured ones)
  const featuredIds = featuredData.docs.map((p) => p.id)
  const postsData = await payload.find({
    collection: 'posts',
    limit: 6,
    sort: '-publishedAt',
    depth: 1,
    where: {
      and: [
        { _status: { equals: 'published' } },
        ...(featuredIds.length > 0 ? [{ id: { not_in: featuredIds } }] : []),
      ],
    },
  })
  
  // Fetch total users count
  const usersData = await payload.find({
    collection: 'users',
    limit: 1,
  })

  // Combine total posts count (featured + regular)
  const totalPostsResult = await payload.count({
    collection: 'posts',
    where: { _status: { equals: 'published' } },
  })

  return (
    <main className="min-h-screen">
      <HeroSection 
        totalPosts={totalPostsResult.totalDocs}
        totalUsers={usersData.totalDocs}
        latestPost={postsData.docs[0] || featuredData.docs[0] || null}
      />
      <FeaturedPosts posts={featuredData.docs} />
      <HomePosts posts={postsData.docs} />
      <FeaturesSection />
      <CTASection />
    </main>
  )
}
