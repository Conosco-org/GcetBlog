import React from 'react'
import type { Metadata } from 'next'
import {
  HeroSection,
  HomePosts,
  FeaturesSection,
  CTASection,
} from '@/components/LandingPage'
import { getPayload } from 'payload'
import config from '@payload-config'

export const metadata: Metadata = {
  title: 'Home',
}

export default async function HomePage() {
  const payload = await getPayload({ config })
  
  // Fetch published posts for the landing page
  const postsData = await payload.find({
    collection: 'posts',
    limit: 5,
    sort: '-publishedAt',
    depth: 1,
    where: {
      _status: {
        equals: 'published',
      },
    },
  })
  
  // Fetch total users count
  const usersData = await payload.find({
    collection: 'users',
    limit: 1,
  })

  return (
    <main className="min-h-screen">
      <HeroSection 
        totalPosts={postsData.totalDocs}
        totalUsers={usersData.totalDocs}
        latestPost={postsData.docs[0] || null}
      />
      <HomePosts posts={postsData.docs} />
      <FeaturesSection />
      <CTASection />
    </main>
  )
}
