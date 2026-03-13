'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Eye, EyeOff, ExternalLink, Loader2 } from 'lucide-react'
import { loginAction } from './actions'
import { GoogleSignInButton } from '@/components/GoogleSignInButton'

interface LoginFormProps {
  redirectTo?: string
  institutionShort?: string
}

export function LoginForm({ redirectTo, institutionShort = 'GCET' }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [correctLoginUrl, setCorrectLoginUrl] = useState<string | null>(null)
  const [correctInstitutionName, setCorrectInstitutionName] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)
    setCorrectLoginUrl(null)
    setCorrectInstitutionName(null)
    setSuccess(false)

    // Add redirect parameter if present
    if (redirectTo) {
      formData.append('redirectTo', redirectTo)
    }

    const result = await loginAction(formData)

    if (result?.error) {
      setError(result.error)
      setCorrectLoginUrl((result as { correctLoginUrl?: string | null }).correctLoginUrl ?? null)
      setCorrectInstitutionName(
        (result as { correctInstitutionName?: string | null }).correctInstitutionName ?? null,
      )
      setIsLoading(false)
    } else if (result?.success && result?.redirectPath) {
      // Login successful - show in button, then redirect
      setSuccess(true)
      router.push(result.redirectPath)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Sign In</CardTitle>
        <CardDescription className="text-center">
          Sign in to your {institutionShort} Blog account
        </CardDescription>
      </CardHeader>

      <form action={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="contributor@gcet.ac.in"
              required
              disabled={isLoading}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                required
                disabled={isLoading}
                className="w-full pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-md bg-destructive/10 text-foreground border border-destructive space-y-2">
              <p className="text-sm">{error}</p>
              {correctLoginUrl && (
                <a
                  href={correctLoginUrl}
                  className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Go to {correctInstitutionName} login
                </a>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" disabled={isLoading || success} className="w-full">
            {isLoading && !success ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing in...
              </>
            ) : success ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Login successful! Redirecting...
              </>
            ) : (
              'Sign In'
            )}
          </Button>

          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <GoogleSignInButton redirectTo={redirectTo} />
        </CardFooter>
      </form>
    </Card>
  )
}
