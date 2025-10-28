import { getCurrentUser } from '../login/actions'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { RegistrationForm } from './RegistrationForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Register',
  description: 'Create your GCET Blog account',
}

export default async function RegisterPage() {
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
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Apply to Join Geethanjali Blog
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create your account to start contributing to the blog
          </p>
        </div>

        <RegistrationForm />

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
