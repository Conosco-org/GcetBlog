import React from 'react'
import type { Metadata } from 'next'
import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import { Sora } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'

import { Footer } from '@/Footer/Component'
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
}

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={cn(GeistSans.variable, GeistMono.variable, sora.variable)} lang="en" suppressHydrationWarning>
      <head>
        <InitTheme />
        <link rel="icon" href="https://res.cloudinary.com/dqpvhbkdd/image/upload/w_32,h_32,c_fit,f_auto/v1761577830/Gcet_Logo_i9fkbt.png" sizes="32x32" />
        <link rel="icon" href="https://res.cloudinary.com/dqpvhbkdd/image/upload/w_64,h_64,c_fit,f_auto/v1761577830/Gcet_Logo_i9fkbt.png" sizes="64x64" />
        <link rel="apple-touch-icon" href="https://res.cloudinary.com/dqpvhbkdd/image/upload/w_180,h_180,c_fit,f_auto/v1761577830/Gcet_Logo_i9fkbt.png" />
      </head>
      <body suppressHydrationWarning>
        <Providers>
          <ConditionalLayout>
            <Header />
            {children}
            <Footer />
          </ConditionalLayout>
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
