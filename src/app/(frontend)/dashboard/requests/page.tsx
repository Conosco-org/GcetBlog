'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../../providers/Auth'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../../components/ui/card'
import { Button } from '../../../../components/ui/button'
import { Textarea } from '../../../../components/ui/textarea'
import { Label } from '../../../../components/ui/label'
import { RadioGroup, RadioGroupItem } from '../../../../components/ui/radio-group'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { Alert, AlertDescription } from '../../../../components/ui/alert'
import Link from 'next/link'

export default function RequestUpgradePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [requestedRole, setRequestedRole] = useState<'editor' | 'admin'>('editor')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setIsSubmitting(true)

    if (!message.trim()) {
      setError('Please provide a reason for your request')
      setIsSubmitting(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append('requestedRole', requestedRole)
      formData.append('message', message.trim())

      // Use the server action from the dashboard
      const { submitRoleUpgradeRequest } = await import('./actions')
      const result = await submitRoleUpgradeRequest(formData)

      if (result.success) {
        setSuccess(true)
        setMessage('')
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } else {
        setError(result.message || 'Failed to submit request')
      }
    } catch (_err) {
      setError('An error occurred while submitting your request')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'contributor') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <p>Only contributors can request role upgrades.</p>
            <Button asChild className="mt-4">
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Request Role Upgrade</CardTitle>
          <CardDescription>
            Request an upgrade to a higher role. Your request will be reviewed by an administrator.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label className="text-base font-medium">Requested Role</Label>
              <RadioGroup
                value={requestedRole}
                onValueChange={(value) => setRequestedRole(value as 'editor' | 'admin')}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="editor" id="editor" />
                  <Label htmlFor="editor" className="font-normal">
                    Editor - Can review and approve posts from contributors
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="admin" id="admin" />
                  <Label htmlFor="admin" className="font-normal">
                    Admin - Full administrative access to the system
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="message" className="text-base font-medium">
                Reason for Request
              </Label>
              <Textarea
                id="message"
                placeholder="Please explain why you should be granted this role. Include your experience, qualifications, and how you plan to contribute..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-2"
                rows={6}
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                Provide a detailed explanation to help administrators evaluate your request.
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Request submitted successfully! Redirecting to dashboard...
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-4">
              <Button type="submit" disabled={isSubmitting || success}>
                {isSubmitting ? 'Submitting...' : success ? 'Submitted!' : 'Submit Request'}
              </Button>
              <Button variant="outline" asChild disabled={isSubmitting}>
                <Link href="/dashboard">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
