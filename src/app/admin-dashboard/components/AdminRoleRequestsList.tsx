'use client'

import { useState } from 'react'
import { approveRoleUpgradeRequest, rejectRoleUpgradeRequest } from '@/app/(frontend)/dashboard/requests/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Shield, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
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
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Role Upgrade Requests
          </CardTitle>
          <CardDescription>No pending requests at this time.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-4 text-muted-foreground">
            <CheckCircle2 className="h-8 w-8 mb-1.5 text-green-500" />
            <p className="text-sm">All caught up!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Pending Role Requests
          <Badge variant="destructive" className="ml-auto">
            {requests.length}
          </Badge>
        </CardTitle>
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
            <div key={request.id} className="rounded-lg border p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-sm font-semibold text-white">
                    {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">
                      {user?.name || 'Unknown User'}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Wants <span className="font-medium capitalize">{request.requestedRole}</span> role
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="border-amber-500/30 text-amber-600 dark:text-amber-400">
                  Pending
                </Badge>
              </div>

              {/* Justification */}
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Justification:</p>
                <p className="text-sm bg-muted/50 p-2 rounded-md">
                  {request.message || 'No message provided'}
                </p>
              </div>

              <p className="text-xs text-muted-foreground">
                Requested {new Date(request.createdAt).toLocaleDateString()}
              </p>

              {/* Admin Notes */}
              <div className="space-y-1">
                <label htmlFor={`notes-${request.id}`} className="text-xs font-medium text-muted-foreground">
                  Admin Notes (optional):
                </label>
                <Textarea
                  id={`notes-${request.id}`}
                  placeholder="Add notes about this decision..."
                  value={adminNotes[request.id] || ''}
                  onChange={(e) =>
                    setAdminNotes((prev) => ({ ...prev, [request.id]: e.target.value }))
                  }
                  className="h-16 text-sm resize-none"
                  disabled={isProcessing}
                />
              </div>

              {/* Status Message */}
              {message && (
                <div
                  className={`text-sm p-2 rounded-md ${
                    message.type === 'success'
                      ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                      : 'bg-red-500/10 text-red-600 dark:text-red-400'
                  }`}
                >
                  {message.text}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleApprove(request.id)}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                  )}
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleReject(request.id)}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-1" />
                  )}
                  Reject
                </Button>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
