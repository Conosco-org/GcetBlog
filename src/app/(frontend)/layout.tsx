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
    icon: 'https://res.cloudinary.com/dqpvhbkdd/image/upload/b_white,c_pad,w_512,h_512/v1761577830/Gcet_Logo_i9fkbt.png',
  },
}

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={cn(GeistSans.variable, GeistMono.variable, sora.variable)} lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <InitTheme />
        <Providers>
          <ConditionalLayout>
            <Header />
            {children}
          </ConditionalLayout>
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
