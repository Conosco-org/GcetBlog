import { getCurrentUser } from './actions'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LoginForm } from './LoginForm'

export default async function LoginPage() {
  // If user is already logged in, redirect to appropriate dashboard
  const user = await getCurrentUser()

  if (user) {
    if (user.role === 'admin') {
      redirect('/admin')
    } else if (user.role === 'editor') {
      redirect('/editor')
    } else {
      redirect('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to GCET Blog
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Access your contributor, editor, or admin dashboard
          </p>
        </div>

        <LoginForm />

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
