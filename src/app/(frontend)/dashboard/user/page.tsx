import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { User } from '@/payload-types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default async function UserDashboardPage() {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })
  
  if (!user) {
    redirect('/login')
  }

  const typedUser = user as User

  // Get role upgrade requests
  const roleRequests = await payload.find({ 
    collection: 'role-upgrade-requests', 
    where: { user: { equals: user.id } }, 
    sort: '-createdAt' 
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {typedUser.name || typedUser.email}</p>
          <Badge variant="outline" className="mt-2">
            {typedUser.role?.toUpperCase()}
          </Badge>
        </div>
        <form action="/api/auth/logout" method="POST">
          <Button type="submit" variant="outline">
            Logout
          </Button>
        </form>
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
            {typedUser.role === 'admin' && (
              <Button className="w-full justify-start" variant="ghost" asChild>
                <Link href="/admin">Admin Panel</Link>
              </Button>
            )}
            {(typedUser.role === 'editor' || typedUser.role === 'admin') && (
              <Button className="w-full justify-start" variant="ghost" asChild>
                <Link href="/editor">Editor Dashboard</Link>
              </Button>
            )}
            {typedUser.role === 'contributor' && (
              <Button className="w-full justify-start" variant="ghost" asChild>
                <Link href="/contributor">Contributor Dashboard</Link>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Role Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Role Requests</CardTitle>
            <CardDescription>Your role upgrade requests</CardDescription>
          </CardHeader>
          <CardContent>
            {roleRequests.docs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No requests</p>
            ) : (
              <div className="space-y-3">
                {roleRequests.docs.map((req) => (
                  <div key={req.id} className="border rounded p-3">
                    <div className="flex justify-between">
                      <span className="font-medium text-sm capitalize">{req.requestedRole}</span>
                      <Badge 
                        variant={
                          req.status === 'approved' 
                            ? 'default' 
                            : req.status === 'rejected' 
                            ? 'destructive' 
                            : 'secondary'
                        } 
                        className="text-xs"
                      >
                        {req.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
            {typedUser.role !== 'admin' && typedUser.role !== 'editor' && (
              <Button className="w-full mt-4" size="sm" asChild>
                <Link href="/dashboard/requests">Request Upgrade</Link>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Email:</span>{' '}
                <span className="text-muted-foreground">{typedUser.email}</span>
              </div>
              <div>
                <span className="font-medium">Role:</span>{' '}
                <span className="text-muted-foreground capitalize">{typedUser.role}</span>
              </div>
              {typedUser.name && (
                <div>
                  <span className="font-medium">Name:</span>{' '}
                  <span className="text-muted-foreground">{typedUser.name}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
