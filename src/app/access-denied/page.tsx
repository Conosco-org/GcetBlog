import Link from 'next/link'
import { Button } from '@frontend/components/ui/button'
import { ShieldAlert } from 'lucide-react'

export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8 max-w-md">
        <div className="flex justify-center">
          <ShieldAlert className="w-20 h-20 text-destructive" />
        </div>
        <h1 className="text-4xl font-bold text-foreground">Access Denied</h1>
        <p className="text-lg text-muted-foreground">
          You don't have permission to access this page.
        </p>
        <p className="text-sm text-muted-foreground">
          If you believe this is an error, please contact your administrator.
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Button asChild variant="default">
            <Link href="/">Go Home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
