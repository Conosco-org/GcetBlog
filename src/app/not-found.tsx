import Link from 'next/link'
import { Button } from '@frontend/components/ui/button'

export default function RootNotFound() {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center space-y-6 p-8">
            <h1 className="text-6xl font-bold text-foreground">404</h1>
            <p className="text-xl text-muted-foreground">Page not found</p>
            <p className="text-sm text-muted-foreground max-w-md">
              The page you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to access it.
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild variant="default">
                <Link href="/">Go Home</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/login">Login</Link>
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
