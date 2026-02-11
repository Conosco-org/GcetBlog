import React from 'react'
import type { Metadata } from 'next'
import {
  HeroSection,
  FeaturesSection,
  StatsSection,
  RecentPostsSection,
  CTASection,
} from '@/components/LandingPage'
import { getPayload } from 'payload'
import config from '@payload-config'

export const metadata: Metadata = {
  title: 'Home',
}

export default async function HomePage() {
  const payload = await getPayload({ config })
  
  // Fetch total posts count
  const postsData = await payload.find({
    collection: 'posts',
    limit: 1,
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
  
  // Fetch latest post
  const latestPostData = await payload.find({
    collection: 'posts',
    limit: 1,
    sort: '-createdAt',
    where: {
      _status: {
        equals: 'published',
      },
    },
  })

  return (
    <main className="min-h-screen">
      <HeroSection 
        totalPosts={postsData.totalDocs}
        totalUsers={usersData.totalDocs}
        latestPost={latestPostData.docs[0] || null}
      />
      <FeaturesSection />
      <StatsSection />
      <RecentPostsSection />
      <CTASection />
    </main>
  )
}
