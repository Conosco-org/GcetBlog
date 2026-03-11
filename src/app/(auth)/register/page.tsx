import { getCurrentUser } from '../login/actions'
import { redirect } from 'next/navigation'
import { SignInLink } from './SignInLink'
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
    const typedUser = user as unknown as { role?: string; roleAssignments?: Array<{ assignedRole: string }> }
    if (typedUser.role === 'superadmin') {
      redirect('/platform')
    } else if (Array.isArray(typedUser.roleAssignments) && typedUser.roleAssignments.length > 0) {
      redirect('/user')
    } else {
      redirect('/')
    }
  }

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-foreground">
            Apply to Join Geethanjali Blog
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Create your account to start contributing to the blog
          </p>
        </div>

        <RegistrationForm />

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account? <SignInLink />
          </p>
        </div>
      </div>
    </div>
  )
}
