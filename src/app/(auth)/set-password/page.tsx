import { SetPasswordForm } from '../../../frontend/features/auth/components/set-password-form'

export const dynamic = 'force-dynamic'

export default function SetPasswordPage() {
  return (
    <div className="container max-w-lg mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome to Geethanjali Blog
        </h1>
        <p className="text-muted-foreground mt-2">
          Your Google account has been linked. Set a password so you can also sign in with email.
        </p>
      </div>
      <SetPasswordForm />
    </div>
  )
}
