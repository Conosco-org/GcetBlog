import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import { Logo } from '@/components/Logo/Logo'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={cn(GeistSans.variable, GeistMono.variable)} lang="en" suppressHydrationWarning>
      <head>
        <InitTheme />
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
      </head>
      <body>
        <Providers>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            {/* Simple header with logo and back button */}
            <div className="container mx-auto px-4 py-6">
              <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                  <Logo loading="eager" priority="high" className="invert dark:invert-0 h-8" />
                </Link>
                <Link 
                  href="/" 
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Home</span>
                </Link>
              </div>
            </div>

            {/* Auth content */}
            <main>{children}</main>

            {/* Simple footer */}
            <footer className="container mx-auto px-4 py-6 mt-8">
              <p className="text-center text-sm text-gray-500">
                © {new Date().getFullYear()} GCET Blog. All rights reserved.
              </p>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  )
}
