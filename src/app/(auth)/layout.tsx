import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import { Sora } from 'next/font/google'
import { Header } from '@/Header/Component'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { getCurrentTenantFull } from '@/utilities/tenantContext'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GCET Blog',
  icons: {
    icon: 'https://res.cloudinary.com/dqpvhbkdd/image/upload/b_white,c_pad,w_512,h_512/v1761577830/Gcet_Logo_i9fkbt.png',
  },
}

const sora = Sora({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-sora',
  display: 'swap',
})

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const tenant = await getCurrentTenantFull()
  const institutionName = tenant?.name ?? 'Platform'

  return (
    <html className={cn(GeistSans.variable, GeistMono.variable, sora.variable)} lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <InitTheme />
        <Providers>
          <Header />
          <main className="min-h-screen">{children}</main>
          <footer className="container mx-auto px-4 py-6">
            <p className="text-center text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} {institutionName}. All rights reserved.
            </p>
            {tenant ? (
              <p className="text-center text-xs text-muted-foreground mt-2">
                Built for the {tenant.shortName ?? tenant.name} community &bull; Powered by{' '}
                <a
                  href="https://conosco.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  Conosco
                </a>
              </p>
            ) : (
              <p className="text-center text-xs text-muted-foreground mt-2">
                Multi-tenant blog platform &bull; Powered by{' '}
                <a
                  href="https://conosco.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  Conosco
                </a>
              </p>
            )}
          </footer>
        </Providers>
      </body>
    </html>
  )
}
