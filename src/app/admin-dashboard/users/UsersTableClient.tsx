'use client'

import type { User } from '@/payload-types'
import { SearchInput } from '@/components/base/SearchInput'
import { FilterBar } from '@/components/base/FilterBar'
import { DataTable, type Column } from '@/components/base/DataTable'
import { Badge } from '@/components/ui/badge'
import { Shield, ShieldCheck, Users } from 'lucide-react'
import { UserActions } from './UserActions'

interface UsersTableClientProps {
  users: User[]
  totalPages: number
  currentPage: number
  totalItems: number
  pageSize: number
  currentUserId: string
  currentUserCanManageAdmins: boolean
  query: string
  roleFilter: string
  adminFilter: string
}

const columns: Column<User>[] = [
  {
    key: 'user',
    header: 'User',
    render: (user) => (
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-xs font-semibold text-white flex-shrink-0">
          {(user.name || user.email || 'U').charAt(0).toUpperCase()}
        </div>
        <span className="font-medium">{user.name || 'Unnamed'}</span>
      </div>
    ),
  },
  {
    key: 'email',
    header: 'Email',
    render: (user) => <span className="text-muted-foreground">{user.email}</span>,
  },
  {
    key: 'role',
    header: 'Role',
    render: (user) => (
      <Badge variant={user.role === 'editor' ? 'default' : 'secondary'} className="capitalize">
        {user.role || 'unknown'}
      </Badge>
    ),
  },
  {
    key: 'flags',
    header: 'Flags',
    render: (user) => (
      <div className="flex gap-1">
        {user.isAdmin && (
          <Badge variant="destructive" className="text-xs">
            <Shield className="h-3 w-3 mr-1" />
            Admin
          </Badge>
        )}
        {user.canManageAdmins && (
          <Badge variant="outline" className="text-xs border-amber-500 text-amber-600">
            <ShieldCheck className="h-3 w-3 mr-1" />
            Super
          </Badge>
        )}
        {!user.isAdmin && !user.canManageAdmins && (
          <span className="text-xs text-muted-foreground">-</span>
        )}
      </div>
    ),
  },
  {
    key: 'joined',
    header: 'Joined',
    render: (user) => (
      <span className="text-muted-foreground text-sm">
        {new Date(user.createdAt).toLocaleDateString()}
      </span>
    ),
  },
]

export function UsersTableClient({
  users,
  totalPages,
  currentPage,
  totalItems,
  pageSize,
  currentUserId,
  currentUserCanManageAdmins,
  query,
  roleFilter,
  adminFilter,
}: UsersTableClientProps) {
  // Add actions column dynamically since it needs props
  const allColumns: Column<User>[] = [
    ...columns,
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (user) => (
        <div className="text-right">
          <UserActions
            user={user}
            currentUserId={currentUserId}
            currentUserCanManageAdmins={currentUserCanManageAdmins}
          />
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchInput
          placeholder="Search by name or email..."
          defaultValue={query}
          paramName="q"
          className="flex-1 max-w-md"
        />
        <FilterBar
          filters={[
            {
              paramName: 'role',
              label: 'Role',
              options: [
                { label: 'All Roles', value: '' },
                { label: 'Editor', value: 'editor' },
                { label: 'Contributor', value: 'contributor' },
              ],
            },
            {
              paramName: 'admin',
              label: 'Access',
              options: [
                { label: 'All Access', value: '' },
                { label: 'Admins', value: 'admin' },
                { label: 'Super Admins', value: 'super' },
                { label: 'Regular', value: 'regular' },
              ],
            },
          ]}
        />
      </div>

      {/* Table */}
      <DataTable
        columns={allColumns}
        data={users}
        totalPages={totalPages}
        currentPage={currentPage}
        totalItems={totalItems}
        pageSize={pageSize}
        getRowKey={(user) => user.id}
        emptyState={{
          icon: Users,
          title: 'No users found',
          description: query || roleFilter || adminFilter
            ? 'Try adjusting your search or filters'
            : 'No users have registered yet',
        }}
        mobileRender={(user) => (
          <div className="rounded-lg border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-xs font-semibold text-white flex-shrink-0">
                  {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{user.name || 'Unnamed'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
              <UserActions
                user={user}
                currentUserId={currentUserId}
                currentUserCanManageAdmins={currentUserCanManageAdmins}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={user.role === 'editor' ? 'default' : 'secondary'} className="capitalize text-xs">
                {user.role || 'unknown'}
              </Badge>
              {user.isAdmin && (
                <Badge variant="destructive" className="text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  Admin
                </Badge>
              )}
              {user.canManageAdmins && (
                <Badge variant="outline" className="text-xs border-amber-500 text-amber-600">
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  Super
                </Badge>
              )}
              <span className="text-xs text-muted-foreground ml-auto">
                Joined {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        )}
      />
    </div>
  )
}
