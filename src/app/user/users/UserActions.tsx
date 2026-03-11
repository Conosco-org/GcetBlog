'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  MoreHorizontal,
  Shield,
  ShieldOff,
  UserCog,
  Trash2,
  Crown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { deleteUser, toggleAdminStatus, toggleCanManageAdmins } from './actions'
import { RoleManagementDialog } from './RoleManagementDialog'

interface UserForActions {
  id: string
  name?: string | null
  email?: string | null
  role?: string
  roleAssignments?: Array<{
    assignedRole: string
    scopeType: string
    scopeId?: string | { id: string }
    scopeLabel?: string
    id?: string | null
  }>
  [key: string]: unknown
}

interface UserActionsProps {
  user: UserForActions
  currentUserId: string
  currentUserCanManageAdmins?: boolean
}

export function UserActions({ user, currentUserId, currentUserCanManageAdmins = false }: UserActionsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showRoleDialog, setShowRoleDialog] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const isOwnAccount = user.id === currentUserId
  const isSuperAdmin = user.role === 'superadmin'
  const isInstAdmin = user.roleAssignments?.some(a => a.assignedRole === 'institution_admin') ?? false

  const showFlash = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteUser(user.id)
      if (result.success) {
        showFlash('success', result.message)
        setTimeout(() => {
          setShowDeleteDialog(false)
          router.refresh()
        }, 1500)
      } else {
        showFlash('error', result.message)
      }
    })
  }

  const handleToggleAdmin = () => {
    startTransition(async () => {
      const result = await toggleAdminStatus(user.id)
      if (result.success) {
        showFlash('success', result.message)
        setTimeout(() => router.refresh(), 1500)
      } else {
        showFlash('error', result.message)
      }
    })
  }

  const handleToggleSuperAdmin = () => {
    startTransition(async () => {
      const result = await toggleCanManageAdmins(user.id)
      if (result.success) {
        showFlash('success', result.message)
        setTimeout(() => router.refresh(), 1500)
      } else {
        showFlash('error', result.message)
      }
    })
  }

  return (
    <>
      {message && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg ${
            message.type === 'success'
              ? 'bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20'
              : 'bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20'
          }`}
        >
          {message.text}
        </div>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" disabled={isPending} aria-label="User actions">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Manage Roles — opens full dialog */}
          <DropdownMenuItem
            onClick={() => setShowRoleDialog(true)}
            disabled={isOwnAccount || isSuperAdmin}
          >
            <UserCog className="mr-2 h-4 w-4 text-blue-500" />
            <span>Manage Roles</span>
          </DropdownMenuItem>

          {currentUserCanManageAdmins && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Admin Actions</DropdownMenuLabel>

              <DropdownMenuItem
                onClick={handleToggleAdmin}
                disabled={isOwnAccount || isSuperAdmin || isPending}
              >
                {isInstAdmin ? (
                  <><ShieldOff className="mr-2 h-4 w-4 text-orange-500" /><span>Revoke Inst. Admin</span></>
                ) : (
                  <><Shield className="mr-2 h-4 w-4 text-blue-500" /><span>Make Inst. Admin</span></>
                )}
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={handleToggleSuperAdmin}
                disabled={isOwnAccount || isPending}
              >
                {isSuperAdmin ? (
                  <><Crown className="mr-2 h-4 w-4 text-orange-500" /><span>Revoke Super Admin</span></>
                ) : (
                  <><Crown className="mr-2 h-4 w-4 text-amber-500" /><span>Make Super Admin</span></>
                )}
              </DropdownMenuItem>
            </>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            disabled={isOwnAccount || isSuperAdmin}
            className="text-red-600 dark:text-red-400"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Delete User</span>
            {isOwnAccount && <span className="ml-auto text-xs">Not allowed</span>}
            {!isOwnAccount && isSuperAdmin && <span className="ml-auto text-xs">Protected</span>}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Role Management Dialog */}
      <RoleManagementDialog
        open={showRoleDialog}
        onOpenChange={setShowRoleDialog}
        targetUser={user}
        isSuperAdmin={currentUserCanManageAdmins}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the user <strong>{user.name || user.email}</strong>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
