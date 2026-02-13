import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { AdminRoleRequestsList } from '../components/AdminRoleRequestsList'
import type { User } from '@/payload-types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminRequestsPage() {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) {
    redirect('/login')
  }
  if ((user as User).role !== 'admin') {
    redirect('/admin-dashboard')
  }

  // Fetch all role upgrade requests
  const pendingRequests = await payload.find({
    collection: 'role-upgrade-requests',
    where: { status: { equals: 'pending' } },
    depth: 1,
    sort: '-createdAt',
  })

  const approvedRequests = await payload.find({
    collection: 'role-upgrade-requests',
    where: { status: { equals: 'approved' } },
    depth: 1,
    sort: '-createdAt',
    limit: 10,
  })

  const rejectedRequests = await payload.find({
    collection: 'role-upgrade-requests',
    where: { status: { equals: 'rejected' } },
    depth: 1,
    sort: '-createdAt',
    limit: 10,
  })

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Role Requests</h1>
        <p className="text-muted-foreground mt-1">
          Review and manage role upgrade requests from users
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{pendingRequests.totalDocs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedRequests.totalDocs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{rejectedRequests.totalDocs}</div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Requests */}
      <AdminRoleRequestsList requests={pendingRequests.docs} />

      {/* Recently Processed */}
      {(approvedRequests.docs.length > 0 || rejectedRequests.docs.length > 0) && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recently Approved */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Recently Approved
              </CardTitle>
              <CardDescription>Last {approvedRequests.docs.length} approved requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {approvedRequests.docs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No approved requests yet.</p>
                ) : (
                  approvedRequests.docs.map((req) => {
                    const reqUser = typeof req.user === 'object' ? req.user : null
                    return (
                      <div key={req.id} className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <p className="text-sm font-medium">{reqUser?.name || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground">
                            Upgraded to <span className="capitalize font-medium">{req.requestedRole}</span>
                          </p>
                        </div>
                        <Badge variant="default" className="bg-green-600">Approved</Badge>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recently Rejected */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <XCircle className="h-5 w-5 text-red-500" />
                Recently Rejected
              </CardTitle>
              <CardDescription>Last {rejectedRequests.docs.length} rejected requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {rejectedRequests.docs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No rejected requests.</p>
                ) : (
                  rejectedRequests.docs.map((req) => {
                    const reqUser = typeof req.user === 'object' ? req.user : null
                    return (
                      <div key={req.id} className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <p className="text-sm font-medium">{reqUser?.name || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground">
                            Requested <span className="capitalize font-medium">{req.requestedRole}</span>
                          </p>
                        </div>
                        <Badge variant="destructive">Rejected</Badge>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
