import React from 'react'
import type { Metadata } from 'next'
import {
  HeroSection,
  FeaturesSection,
  StatsSection,
  RecentPostsSection,
  CTASection,
} from '@/components/LandingPage'

export const metadata: Metadata = {
  title: 'Home',
}

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <StatsSection />
      <RecentPostsSection />
      <CTASection />
    </main>
  )
}
