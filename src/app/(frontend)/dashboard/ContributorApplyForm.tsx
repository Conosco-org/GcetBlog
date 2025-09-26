'use client'

import { useState } from 'react'
import { submitRoleUpgradeRequest } from './requests/actions'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ContributorApplyFormProps {
  currentRole?: string
  hasExistingRequest?: boolean
}

export function ContributorApplyForm({
  currentRole = 'contributor',
  hasExistingRequest = false,
}: ContributorApplyFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null)

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    setMessage('')
    setMessageType(null)

    try {
      const result = await submitRoleUpgradeRequest(formData)

      if (result.success) {
        setMessageType('success')
        setMessage(result.message)
        // Reset form
        const form = document.getElementById('role-upgrade-form') as HTMLFormElement
        form?.reset()
      } else {
        setMessageType('error')
        setMessage(result.message)
      }
    } catch (_error) {
      setMessageType('error')
      setMessage('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (currentRole === 'admin') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Role Upgrade</CardTitle>
          <CardDescription>You already have the highest role (Admin).</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (hasExistingRequest) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Role Upgrade Request</CardTitle>
          <CardDescription>
            You already have a pending role upgrade request. Please wait for admin review.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Role Upgrade</CardTitle>
        <CardDescription>
          Request to upgrade your role from {currentRole} to Editor or Admin.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="role-upgrade-form" action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="requestedRole" className="text-sm font-medium">
              Requested Role
            </label>
            <Select name="requestedRole" required>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="editor">Editor</SelectItem>
                {currentRole === 'editor' && <SelectItem value="admin">Admin</SelectItem>}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium">
              Justification
            </label>
            <Textarea
              id="message"
              name="message"
              placeholder="Explain why you should be granted this role..."
              required
              rows={4}
            />
          </div>

          {message && (
            <div
              className={`p-4 rounded-md ${
                messageType === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message}
            </div>
          )}

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
