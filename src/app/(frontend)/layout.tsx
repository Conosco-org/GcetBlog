import React from 'react'
import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'

import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { ConditionalLayout } from './ConditionalLayout'

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={cn(GeistSans.variable, GeistMono.variable)} lang="en" suppressHydrationWarning>
      <head>
        <InitTheme />
        <link href="https://res.cloudinary.com/dqpvhbkdd/image/upload/b_white,c_pad,w_512,h_512/v1761577830/Gcet_Logo_i9fkbt.png" rel="icon" type="image/png" />
      </head>
      <body suppressHydrationWarning>
        <Providers>
          <ConditionalLayout>
            <Header />
            {children}
            <Footer />
          </ConditionalLayout>
        </Providers>
      </body>
    </html>
  )
}
