import { getCurrentUser } from './actions'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LoginForm } from './LoginForm'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { redirect?: string; message?: string }
}) {
  // If user is already logged in, redirect to appropriate dashboard or requested page
  const user = await getCurrentUser()

  if (user) {
    // If there's a redirect parameter, validate and use it
    const redirectTo = searchParams.redirect
    
    if (redirectTo && redirectTo.startsWith('/')) {
      // Ensure redirect is to a safe internal path
      redirect(redirectTo)
    }
    
    // Default role-based redirect
    if (user.role === 'admin') {
      redirect('/admin')
    } else if (user.role === 'editor') {
      redirect('/editor')
    } else {
      redirect('/dashboard')
    }
  }

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Sign in to GCET Blog
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Access your contributor, editor, or admin dashboard
          </p>
          
          {/* Show session expired or other messages */}
          {searchParams.message && (
            <div className="mt-4 p-3 rounded-md bg-yellow-50 border border-yellow-200">
              <p className="text-sm text-yellow-800 text-center">{searchParams.message}</p>
            </div>
          )}
        </div>

        <LoginForm redirectTo={searchParams.redirect} />

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
              Apply to become a contributor
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
