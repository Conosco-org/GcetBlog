import React from 'react'
import {
  HeroSection,
  FeaturesSection,
  StatsSection,
  RecentPostsSection,
  CTASection,
} from '@/components/LandingPage'

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
