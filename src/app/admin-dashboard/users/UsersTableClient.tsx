'use client'

import { SearchInput } from '@/components/base/SearchInput'
import { FilterBar } from '@/components/base/FilterBar'
import { DataTable, type Column } from '@/components/base/DataTable'
import { Badge } from '@/components/ui/badge'
import { Shield, ShieldCheck, Users } from 'lucide-react'
import { UserActions } from './UserActions'

interface UserForTable {
  id: string
  name?: string | null
  email?: string | null
  role?: string
  createdAt: string
  roleAssignments?: Array<{
    assignedRole: string
    scopeType: string
    scopeId?: string | { id: string }
    scopeLabel?: string
  }>
  [key: string]: unknown
}

interface UsersTableClientProps {
  users: UserForTable[]
  totalPages: number
  currentPage: number
  totalItems: number
  pageSize: number
  currentUserId: string
  currentUserIsSuperAdmin: boolean
  query: string
  roleFilter: string
  adminFilter: string
}

/** Get the primary role label for a user */
function getPrimaryRoleLabel(user: UserForTable): string {
  if (user.role === 'superadmin') return 'Super Admin'
  const instAdmin = user.roleAssignments?.find(a => a.assignedRole === 'institution_admin')
  if (instAdmin) return 'Institution Admin'
  const first = user.roleAssignments?.[0]
  if (first) return first.assignedRole.replace(/_/g, ' ')
  return 'User'
}

const columns: Column<UserForTable>[] = [
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
    render: (user) => {
      const label = getPrimaryRoleLabel(user)
      const variant = user.role === 'superadmin' || user.roleAssignments?.some(a => a.assignedRole === 'institution_admin')
        ? 'destructive'
        : (user.roleAssignments?.length ?? 0) > 0
          ? 'default'
          : 'secondary'
      return (
        <Badge variant={variant} className="capitalize">
          {label}
        </Badge>
      )
    },
  },
  {
    key: 'flags',
    header: 'Roles',
    render: (user) => {
      const assignments = user.roleAssignments ?? []
      if (user.role === 'superadmin') {
        return (
          <Badge variant="outline" className="text-xs border-amber-500 text-amber-600">
            <ShieldCheck className="h-3 w-3 mr-1" />
            Platform Owner
          </Badge>
        )
      }
      if (assignments.length === 0) {
        return <span className="text-xs text-muted-foreground">No roles assigned</span>
      }
      return (
        <div className="flex flex-wrap gap-1">
          {assignments.slice(0, 3).map((a, i) => (
            <Badge key={i} variant="outline" className="text-xs">
              {a.assignedRole === 'institution_admin' && <Shield className="h-3 w-3 mr-1" />}
              {a.assignedRole.replace(/_/g, ' ')}
              {a.scopeLabel ? ` (${a.scopeLabel})` : ''}
            </Badge>
          ))}
          {assignments.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{assignments.length - 3} more
            </Badge>
          )}
        </div>
      )
    },
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
  currentUserIsSuperAdmin,
  query,
  roleFilter,
  adminFilter,
}: UsersTableClientProps) {
  // Add actions column dynamically since it needs props
  const allColumns: Column<UserForTable>[] = [
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
            currentUserCanManageAdmins={currentUserIsSuperAdmin}
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
                { label: 'Institution Admin', value: 'institution_admin' },
                { label: 'Blog Editor', value: 'blog_editor' },
                { label: 'Blog Author', value: 'blog_author' },
                { label: 'Club Admin', value: 'club_admin' },
                { label: 'Event Manager', value: 'event_manager' },
                { label: 'Moderator', value: 'moderator' },
              ],
            },
            {
              paramName: 'admin',
              label: 'Access',
              options: [
                { label: 'All Access', value: '' },
                { label: 'Super Admin', value: 'super' },
                { label: 'Inst. Admin', value: 'institution_admin' },
                { label: 'Has Roles', value: 'has_roles' },
                { label: 'No Roles', value: 'no_roles' },
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
                currentUserCanManageAdmins={currentUserIsSuperAdmin}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={(user.roleAssignments?.length ?? 0) > 0 ? 'default' : 'secondary'} className="capitalize text-xs">
                {getPrimaryRoleLabel(user)}
              </Badge>
              {user.role === 'superadmin' && (
                <Badge variant="outline" className="text-xs border-amber-500 text-amber-600">
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  Platform
                </Badge>
              )}
              {user.roleAssignments?.some(a => a.assignedRole === 'institution_admin') && (
                <Badge variant="destructive" className="text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  Admin
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
