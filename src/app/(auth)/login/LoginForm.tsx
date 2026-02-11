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
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { loginAction } from './actions'

interface LoginFormProps {
  redirectTo?: string
}

export function LoginForm({ redirectTo }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setMessage(null)

    // Add redirect parameter if present
    if (redirectTo) {
      formData.append('redirectTo', redirectTo)
    }

    const result = await loginAction(formData)

    if (result?.error) {
      setMessage({ type: 'error', text: result.error })
      setIsLoading(false)
    } else if (result?.success && result?.redirectPath) {
      // Login successful - redirect to the appropriate page
      setMessage({ type: 'success', text: 'Login successful! Redirecting...' })
      router.push(result.redirectPath)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Sign In</CardTitle>
        <CardDescription className="text-center">
          Enter your email and password to access your account
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

          {message && (
            <div
              className={`p-3 rounded-md ${
                message.type === 'success'
                  ? 'bg-success/20 text-foreground border border-success'
                  : 'bg-destructive/10 text-foreground border border-destructive'
              }`}
            >
              {message.text}
            </div>
          )}
        </CardContent>

        <CardFooter>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
