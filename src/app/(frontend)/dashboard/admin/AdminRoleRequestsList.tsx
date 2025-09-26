'use client'

import { useState } from 'react'
import { approveRoleUpgradeRequest, rejectRoleUpgradeRequest } from '../requests/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import type { RoleUpgradeRequest } from '@/payload-types'

interface AdminRoleRequestsListProps {
  requests: RoleUpgradeRequest[]
}

export function AdminRoleRequestsList({ requests }: AdminRoleRequestsListProps) {
  const [processingIds, setProcessingIds] = useState<string[]>([])
  const [adminNotes, setAdminNotes] = useState<{ [key: string]: string }>({})
  const [messages, setMessages] = useState<{
    [key: string]: { type: 'success' | 'error'; text: string }
  }>({})

  async function handleApprove(requestId: string) {
    setProcessingIds((prev) => [...prev, requestId])

    try {
      const result = await approveRoleUpgradeRequest(requestId, adminNotes[requestId] || '')

      if (result.success) {
        setMessages((prev) => ({ ...prev, [requestId]: { type: 'success', text: result.message } }))
        // Optionally reload the page or update state
        setTimeout(() => window.location.reload(), 1500)
      } else {
        setMessages((prev) => ({ ...prev, [requestId]: { type: 'error', text: result.message } }))
      }
    } catch (_error) {
      setMessages((prev) => ({
        ...prev,
        [requestId]: { type: 'error', text: 'An error occurred' },
      }))
    } finally {
      setProcessingIds((prev) => prev.filter((id) => id !== requestId))
    }
  }

  async function handleReject(requestId: string) {
    setProcessingIds((prev) => [...prev, requestId])

    try {
      const result = await rejectRoleUpgradeRequest(requestId, adminNotes[requestId] || '')

      if (result.success) {
        setMessages((prev) => ({ ...prev, [requestId]: { type: 'success', text: result.message } }))
        // Optionally reload the page or update state
        setTimeout(() => window.location.reload(), 1500)
      } else {
        setMessages((prev) => ({ ...prev, [requestId]: { type: 'error', text: result.message } }))
      }
    } catch (_error) {
      setMessages((prev) => ({
        ...prev,
        [requestId]: { type: 'error', text: 'An error occurred' },
      }))
    } finally {
      setProcessingIds((prev) => prev.filter((id) => id !== requestId))
    }
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Role Upgrade Requests</CardTitle>
          <CardDescription>No pending requests at this time.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Role Upgrade Requests</CardTitle>
        <CardDescription>
          Review and approve/reject role upgrade requests from contributors.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {requests.map((request) => {
          const user = typeof request.user === 'object' ? request.user : null
          const isProcessing = processingIds.includes(request.id)
          const message = messages[request.id]

          return (
            <div key={request.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">
                    {user?.name || 'Unknown User'} → {request.requestedRole}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Requested {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                  Pending
                </span>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Justification:</p>
                <p className="text-sm text-muted-foreground bg-gray-50 p-2 rounded">
                  {request.message || 'No message provided'}
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor={`notes-${request.id}`} className="text-sm font-medium">
                  Admin Notes (optional):
                </label>
                <Textarea
                  id={`notes-${request.id}`}
                  value={adminNotes[request.id] || ''}
                  onChange={(e) =>
                    setAdminNotes((prev) => ({ ...prev, [request.id]: e.target.value }))
                  }
                  placeholder="Add notes for this decision..."
                  rows={2}
                />
              </div>

              {message && (
                <div
                  className={`p-3 rounded-md text-sm ${
                    message.type === 'success'
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {message.text}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={() => handleApprove(request.id)}
                  disabled={isProcessing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isProcessing ? 'Processing...' : 'Approve'}
                </Button>
                <Button
                  onClick={() => handleReject(request.id)}
                  disabled={isProcessing}
                  variant="destructive"
                >
                  {isProcessing ? 'Processing...' : 'Reject'}
                </Button>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
