import { getPayload, type Where } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import type { User } from '@/payload-types'
import { PageHeader } from '@/components/base/PageHeader'
import { UsersTableClient } from './UsersTableClient'

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

  // Build where clause
  const conditions: Where[] = []

  if (query) {
    conditions.push({
      or: [
        { name: { like: query } },
        { email: { like: query } },
      ],
    })
  }

  if (roleFilter) {
    conditions.push({ role: { equals: roleFilter } })
  }

  if (adminFilter === 'admin') {
    conditions.push({ isAdmin: { equals: true } })
  } else if (adminFilter === 'super') {
    conditions.push({ canManageAdmins: { equals: true } })
  } else if (adminFilter === 'regular') {
    conditions.push({ isAdmin: { not_equals: true } })
  }

  const where: Where | undefined = conditions.length > 0 ? { and: conditions } : undefined

  // Parallel queries: users + stats
  const [usersResult, totalEditors, totalContributors, totalAdmins] = await Promise.all([
    payload.find({
      collection: 'users',
      limit: PAGE_SIZE,
      page,
      sort: '-createdAt',
      depth: 0,
      where,
    }),
    payload.count({ collection: 'users', where: { role: { equals: 'editor' } } }),
    payload.count({ collection: 'users', where: { role: { equals: 'contributor' } } }),
    payload.count({ collection: 'users', where: { isAdmin: { equals: true } } }),
  ])

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="User Management"
        description="Manage all platform users, roles, and permissions"
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total Users" value={usersResult.totalDocs} color="blue" />
        <StatCard label="Admins" value={totalAdmins.totalDocs} color="red" />
        <StatCard label="Editors" value={totalEditors.totalDocs} color="purple" />
        <StatCard label="Contributors" value={totalContributors.totalDocs} color="green" />
      </div>

      {/* Users Table with search/filter/pagination */}
      <UsersTableClient
        users={usersResult.docs as User[]}
        totalPages={usersResult.totalPages}
        currentPage={usersResult.page || page}
        totalItems={usersResult.totalDocs}
        pageSize={PAGE_SIZE}
        currentUserId={fullCurrentUser?.id || ''}
        currentUserCanManageAdmins={fullCurrentUser?.canManageAdmins === true}
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
