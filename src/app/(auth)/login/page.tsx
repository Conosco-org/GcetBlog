import { getCurrentUser } from './actions'
import { redirect } from 'next/navigation'
import { RegisterLink } from './RegisterLink'
import { LoginForm } from './LoginForm'
import { getCurrentTenantFull } from '@/utilities/tenantContext'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login',
  description: 'Sign in to your account',
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; message?: string }>
}) {
  const params = await searchParams

  // Resolve tenant for branding
  const tenant = await getCurrentTenantFull()
  const institutionName = tenant?.name ?? 'GCET Blog'
  const institutionShort = tenant?.shortName ?? 'GCET'

  // If user is already logged in, redirect to appropriate dashboard or requested page
  const user = await getCurrentUser()

  if (user) {
    const redirectTo = params.redirect
    if (redirectTo && redirectTo.startsWith('/')) {
      redirect(redirectTo)
    }
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
            Sign in to {institutionShort} Blog
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            {institutionName} &mdash; Access your dashboard
          </p>

          {params.message && (
            <div className="mt-4 p-3 rounded-md bg-warning/20 border border-warning">
              <p className="text-sm text-foreground text-center">{params.message}</p>
            </div>
          )}
        </div>

        <LoginForm redirectTo={params.redirect} institutionShort={institutionShort} />

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account? <RegisterLink />
          </p>
        </div>
      </div>
    </div>
  )
}
