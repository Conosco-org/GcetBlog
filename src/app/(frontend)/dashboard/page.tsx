'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '../../../providers/Auth'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { logoutAction } from '../login/actions'

interface RoleUpgradeRequest {
  id: string
  requestedRole: 'editor' | 'admin'
  message: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const [roleRequests, setRoleRequests] = useState<RoleUpgradeRequest[]>([])
  const [loadingRequests, setLoadingRequests] = useState(false)

  useEffect(() => {
    if (user) {
      fetchRoleRequests()
    }
  }, [user])

  const fetchRoleRequests = async () => {
    setLoadingRequests(true)
    try {
      const response = await fetch('/api/role-requests')
      if (response.ok) {
        const requests = await response.json()
        setRoleRequests(requests)
      }
    } catch (error) {
      console.error('Error fetching role requests:', error)
    } finally {
      setLoadingRequests(false)
    }
  }

  const handleLogout = async () => {
    await logoutAction()
    window.location.href = '/'
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-48 mb-8"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <p>Please log in to access your dashboard.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user.name || user.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge
              variant={
                user.role === 'admin' ? 'default' : user.role === 'editor' ? 'secondary' : 'outline'
              }
            >
              {user.role}
            </Badge>
          </div>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start" variant="ghost" asChild>
              <Link href="/posts">Browse Posts</Link>
            </Button>
            {user.role === 'admin' && (
              <>
                <Button className="w-full justify-start" variant="ghost" asChild>
                  <Link href="/dashboard/admin">Admin Panel</Link>
                </Button>
                <Button className="w-full justify-start" variant="ghost" asChild>
                  <Link href="/admin">Payload Admin</Link>
                </Button>
              </>
            )}
            {(user.role === 'editor' || user.role === 'admin') && (
              <Button className="w-full justify-start" variant="ghost" asChild>
                <Link href="/editor/queue">Editor Queue</Link>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Role Upgrade Status */}
        <Card>
          <CardHeader>
            <CardTitle>Role Upgrade Requests</CardTitle>
            <CardDescription>Your pending role upgrade requests</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingRequests ? (
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ) : roleRequests.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pending requests</p>
            ) : (
              <div className="space-y-3">
                {roleRequests.map((request) => (
                  <div key={request.id} className="border rounded p-3">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-sm">{request.requestedRole} Role</span>
                      <Badge
                        variant={
                          request.status === 'approved'
                            ? 'default'
                            : request.status === 'rejected'
                              ? 'destructive'
                              : 'secondary'
                        }
                        className="text-xs"
                      >
                        {request.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{request.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
            {user.role === 'contributor' && (
              <Button className="w-full mt-4" size="sm" asChild>
                <Link href="/dashboard/request-upgrade">Request Role Upgrade</Link>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Email:</span>{' '}
                <span className="text-muted-foreground">{user.email}</span>
              </div>
              <div>
                <span className="font-medium">Role:</span>{' '}
                <span className="text-muted-foreground capitalize">{user.role}</span>
              </div>
              {user.name && (
                <div>
                  <span className="font-medium">Name:</span>{' '}
                  <span className="text-muted-foreground">{user.name}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
