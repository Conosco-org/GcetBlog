import { getPayload, type Where } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import type { User } from '@/payload-types'
import { PageHeader } from '@/components/base/PageHeader'
import { UsersTableClient } from './UsersTableClient'
import { getCurrentTenant } from '@/utilities/tenantContext'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const PAGE_SIZE = 15

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string; role?: string; admin?: string }>
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const params = await searchParams
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const { user: currentUser } = await payload.auth({ headers: requestHeaders })

  const fullCurrentUser = currentUser
    ? await payload.findByID({ collection: 'users', id: currentUser.id, depth: 0 })
    : null

  const query = params.q || ''
  const page = Math.max(1, Number(params.page) || 1)
  const roleFilter = params.role || ''
  const adminFilter = params.admin || ''

  const isSuperAdmin = fullCurrentUser?.role === 'superadmin'
  
  // Get current tenant for institution filtering
  const tenant = await getCurrentTenant()

  // Build where clause
  const conditions: Where[] = []

  // Non-superadmins should NEVER see superadmin users
  if (!isSuperAdmin) {
    conditions.push({ role: { not_equals: 'superadmin' } })
    
    // Non-superadmins should only see users from their institution
    if (tenant) {
      conditions.push({ institution: { equals: tenant.institutionId } })
    }
  }

  if (query) {
    conditions.push({
      or: [
        { name: { like: query } },
        { email: { like: query } },
      ],
    })
  }

  if (roleFilter) {
    // Filter by role assignment
    // This is a workaround - Payload may not support deep querying roleAssignments directly
    // Fall through for now
  }

  if (adminFilter === 'super') {
    conditions.push({ role: { equals: 'superadmin' } })
  } else if (adminFilter === 'institution_admin') {
    conditions.push({ 'roleAssignments.assignedRole': { equals: 'institution_admin' } })
  } else if (adminFilter === 'has_roles') {
    conditions.push({ 'roleAssignments.assignedRole': { exists: true } })
  } else if (adminFilter === 'no_roles') {
    conditions.push({ 'roleAssignments.assignedRole': { exists: false } })
  }

  const where: Where | undefined = conditions.length > 0 ? { and: conditions } : undefined

  // Parallel queries: users + stats
  const [usersResult, totalWithRoles, totalSuperAdmins, totalInstAdmins] = await Promise.all([
    payload.find({
      collection: 'users',
      limit: PAGE_SIZE,
      page,
      sort: '-createdAt',
      depth: 0,
      where,
    }),
    payload.count({ collection: 'users', where: { 'roleAssignments.assignedRole': { exists: true } } }),
    isSuperAdmin
      ? payload.count({ collection: 'users', where: { role: { equals: 'superadmin' } } })
      : Promise.resolve({ totalDocs: 0 }),
    payload.count({ collection: 'users', where: { 'roleAssignments.assignedRole': { equals: 'institution_admin' } } }),
  ])

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="User Management"
        description="Manage all platform users, roles, and permissions"
      />

      {/* Stats */}
      <div className={`grid gap-4 ${isSuperAdmin ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
        <StatCard label="Total Users" value={usersResult.totalDocs} color="blue" />
        {isSuperAdmin && (
          <StatCard label="Super Admins" value={totalSuperAdmins.totalDocs} color="red" />
        )}
        <StatCard label="Inst. Admins" value={totalInstAdmins.totalDocs} color="purple" />
        <StatCard label="With Roles" value={totalWithRoles.totalDocs} color="green" />
      </div>

      {/* Users Table with search/filter/pagination */}
      <UsersTableClient
        users={usersResult.docs as any}
        totalPages={usersResult.totalPages}
        currentPage={usersResult.page || page}
        totalItems={usersResult.totalDocs}
        pageSize={PAGE_SIZE}
        currentUserId={fullCurrentUser?.id || ''}
        currentUserIsSuperAdmin={isSuperAdmin}
        query={query}
        roleFilter={roleFilter}
        adminFilter={adminFilter}
      />
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colorMap: Record<string, string> = {
    blue: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30',
    red: 'text-red-600 bg-red-50 dark:bg-red-950/30',
    purple: 'text-purple-600 bg-purple-50 dark:bg-purple-950/30',
    green: 'text-green-600 bg-green-50 dark:bg-green-950/30',
  }
  return (
    <div className={`rounded-lg border p-4 ${colorMap[color] || ''}`}>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  )
}
