import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Users, Shield, UserCog } from 'lucide-react'
import { UserActions } from './UserActions'
import type { User } from '@/payload-types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminUsersPage() {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user || (user as User).role !== 'admin') {
    return null
  }

  const currentUserId = (user as User).id

  // Fetch all users with pagination
  const allUsers = await payload.find({
    collection: 'users',
    sort: '-createdAt',
    limit: 50,
    depth: 0,
  })

  // Role counts
  const [adminCount, editorCount, contributorCount, userCount] = await Promise.all([
    payload.find({ collection: 'users', where: { role: { equals: 'admin' } }, limit: 0 }),
    payload.find({ collection: 'users', where: { role: { equals: 'editor' } }, limit: 0 }),
    payload.find({ collection: 'users', where: { role: { equals: 'contributor' } }, limit: 0 }),
    payload.find({ collection: 'users', where: { role: { equals: 'user' } }, limit: 0 }),
  ])

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive' as const
      case 'editor': return 'default' as const
      case 'contributor': return 'secondary' as const
      default: return 'outline' as const
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage all registered users and their roles
        </p>
      </div>

      {/* Role Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Shield className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminCount.totalDocs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Editors</CardTitle>
            <UserCog className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{editorCount.totalDocs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contributors</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contributorCount.totalDocs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Regular Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userCount.totalDocs}</div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            All Users
          </CardTitle>
          <CardDescription>
            Showing {allUsers.docs.length} of {allUsers.totalDocs} users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allUsers.docs.map((u) => {
                const typedU = u as User
                return (
                  <TableRow key={typedU.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-semibold text-white">
                          {(typedU.name || typedU.email || 'U').charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">{typedU.name || 'Unnamed'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {typedU.email}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(typedU.role || 'user')} className="capitalize">
                        {typedU.role || 'user'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(typedU.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <UserActions user={typedU} currentUserId={currentUserId} />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {allUsers.totalDocs === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No users found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
