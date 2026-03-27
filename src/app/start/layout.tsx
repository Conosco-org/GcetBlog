import React from 'react'
import { cn } from '@/utilities/ui'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { Providers } from '@/providers'
import '@/app/(frontend)/globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Conosco Content Engine',
    template: '%s | Conosco',
  },
}

export default function StartLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={cn(GeistSans.variable, GeistMono.variable)} lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased" suppressHydrationWarning>
        <InitTheme />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
