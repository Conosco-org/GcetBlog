import React from 'react'
import type { Metadata } from 'next'
import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import { Sora } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'

import { Header } from '@/Header/Component'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { ConditionalLayout } from './ConditionalLayout'
import { PageViewTracker } from '@/components/PageViewTracker'
import { TenantProvider, type ClientTenant } from '@/providers/Tenant'
import { getCurrentTenantFull } from '@/utilities/tenantContext'

const sora = Sora({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-sora',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'GCET Blog',
    template: '%s | GCET Blog',
  },
  description: 'Official blog platform for Geethanjali College of Engineering and Technology',
  icons: {
    icon: '/gcet-logo.png',
    apple: '/gcet-logo.png',
  },
}

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  // Resolve the current tenant from middleware headers (multi-tenant)
  const resolvedTenant = await getCurrentTenantFull()
  const clientTenant: ClientTenant | null = resolvedTenant
    ? {
        institutionId: resolvedTenant.institutionId,
        code: resolvedTenant.code,
        name: resolvedTenant.name,
        shortName: resolvedTenant.shortName,
        purpose: resolvedTenant.purpose,
        clubScope: resolvedTenant.clubScope,
        branding: resolvedTenant.branding,
      }
    : null

  return (
    <html className={cn(GeistSans.variable, GeistMono.variable, sora.variable)} lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <InitTheme />
        <TenantProvider tenant={clientTenant}>
          <Providers>
            <PageViewTracker />
            <ConditionalLayout>
              <Header />
              {children}
            </ConditionalLayout>
          </Providers>
        </TenantProvider>
        <Analytics />
      </body>
    </html>
  )
}
