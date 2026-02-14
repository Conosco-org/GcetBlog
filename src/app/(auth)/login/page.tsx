import { getCurrentUser } from './actions'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LoginForm } from './LoginForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login',
  description: 'Sign in to your GCET Blog account',
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; message?: string }>
}) {
  // Await searchParams (Next.js 15 requirement)
  const params = await searchParams
  
  // If user is already logged in, redirect to appropriate dashboard or requested page
  const user = await getCurrentUser()

  if (user) {
    // If there's a redirect parameter, validate and use it
    const redirectTo = params.redirect
    
    if (redirectTo && redirectTo.startsWith('/')) {
      // Ensure redirect is to a safe internal path
      redirect(redirectTo)
    }
    
    // Default role-based redirect
    const typedUser = user as unknown as { isAdmin?: boolean; role?: string }
    if (typedUser.isAdmin) {
      redirect('/admin-dashboard')
    } else if (typedUser.role === 'editor') {
      redirect('/editor')
    } else {
      redirect('/contributor')
    }
  }

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-foreground">
            Sign in to Geethanjali Blog
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Access your contributor, editor, or admin dashboard
          </p>
          
          {/* Show session expired or other messages */}
          {params.message && (
            <div className="mt-4 p-3 rounded-md bg-warning/20 border border-warning">
              <p className="text-sm text-foreground text-center">{params.message}</p>
            </div>
          )}
        </div>

        <LoginForm redirectTo={params.redirect} />

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-medium text-primary hover:text-primary/80">
              Apply to become a contributor
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
