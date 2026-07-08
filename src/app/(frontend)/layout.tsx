import React from 'react'
import type { Metadata } from 'next'
import { cn } from '@/frontend/lib/utils'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import { Sora } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'

import '@/frontend/styles/globals.css'

import { Header } from '@/frontend/components/layout/header/header'
import { Providers } from '@/frontend/providers'
import { InitTheme } from '@/frontend/providers/Theme/InitTheme'
import { ConditionalLayout } from './ConditionalLayout'
import { PageViewTracker } from '@frontend/components/shared/page-view-tracker'

const sora = Sora({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-sora',
  display: 'swap',
})

export const metadata: Metadata = {
  description: 'Official blog platform for Geethanjali College of Engineering and Technology',
  icons: {
    icon: '/gcet-logo.png',
    apple: '/gcet-logo.png',
  },
}

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={cn(GeistSans.variable, GeistMono.variable, sora.variable)} lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <InitTheme />
        <Providers>
          <PageViewTracker />
          <ConditionalLayout>
            <Header />
            {children}
          </ConditionalLayout>
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
