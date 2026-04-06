'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  MoreHorizontal,
  Shield,
  ShieldOff,
  UserCog,
  Users,
  Trash2,
  Crown,
} from 'lucide-react'
import { Button } from '@frontend/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/frontend/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/frontend/components/ui/alert-dialog'
import { changeUserRole, deleteUser, toggleAdminStatus, toggleCanManageAdmins } from './actions'
import type { User } from '@/shared/types/payload-types'

interface UserActionsProps {
  user: User
  currentUserId: string
  currentUserCanManageAdmins?: boolean
}

export function UserActions({ user, currentUserId, currentUserCanManageAdmins = false }: UserActionsProps) {
  const router = useRouter()
  const [isChangingRole, setIsChangingRole] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isTogglingAdmin, setIsTogglingAdmin] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const isOwnAccount = user.id === currentUserId

  const handleRoleChange = async (newRole: 'contributor' | 'editor') => {
    setIsChangingRole(true)
    const result = await changeUserRole(user.id, newRole)
    
    if (result.success) {
      setMessage({ type: 'success', text: result.message })
      setTimeout(() => {
        setMessage(null)
        router.refresh()
      }, 2000)
    } else {
      setMessage({ type: 'error', text: result.message })
      setTimeout(() => setMessage(null), 3000)
    }
    setIsChangingRole(false)
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    const result = await deleteUser(user.id)
    
    if (result.success) {
      setMessage({ type: 'success', text: result.message })
      setTimeout(() => {
        setShowDeleteDialog(false)
        router.refresh()
      }, 1500)
    } else {
      setMessage({ type: 'error', text: result.message })
      setTimeout(() => setMessage(null), 3000)
    }
    setIsDeleting(false)
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
          <Button variant="ghost" size="sm" disabled={isChangingRole} aria-label="User actions">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Change Role</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem
            onClick={() => handleRoleChange('editor')}
            disabled={user.role === 'editor' || isOwnAccount || isChangingRole}
          >
            <UserCog className="mr-2 h-4 w-4 text-blue-500" />
            <span>Editor</span>
            {user.role === 'editor' && <span className="ml-auto text-xs">Current</span>}
          </DropdownMenuItem>
          
          <DropdownMenuItem
            onClick={() => handleRoleChange('contributor')}
            disabled={user.role === 'contributor' || isOwnAccount || isChangingRole}
          >
            <Users className="mr-2 h-4 w-4 text-green-500" />
            <span>Contributor</span>
            {user.role === 'contributor' && <span className="ml-auto text-xs">Current</span>}
          </DropdownMenuItem>

          {currentUserCanManageAdmins && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Admin Flags</DropdownMenuLabel>
              
              <DropdownMenuItem
                onClick={async () => {
                  setIsTogglingAdmin(true)
                  const result = await toggleAdminStatus(user.id)
                  if (result.success) {
                    setMessage({ type: 'success', text: result.message })
                    setTimeout(() => { setMessage(null); router.refresh() }, 2000)
                  } else {
                    setMessage({ type: 'error', text: result.message })
                    setTimeout(() => setMessage(null), 3000)
                  }
                  setIsTogglingAdmin(false)
                }}
                disabled={isOwnAccount || user.role !== 'editor' || isTogglingAdmin}
              >
                {user.isAdmin ? (
                  <><ShieldOff className="mr-2 h-4 w-4 text-orange-500" /><span>Revoke Admin</span></>
                ) : (
                  <><Shield className="mr-2 h-4 w-4 text-blue-500" /><span>Make Admin</span></>
                )}
                {user.role !== 'editor' && <span className="ml-auto text-xs">Editor only</span>}
              </DropdownMenuItem>

              {user.isAdmin && (
                <DropdownMenuItem
                  onClick={async () => {
                    setIsTogglingAdmin(true)
                    const result = await toggleCanManageAdmins(user.id)
                    if (result.success) {
                      setMessage({ type: 'success', text: result.message })
                      setTimeout(() => { setMessage(null); router.refresh() }, 2000)
                    } else {
                      setMessage({ type: 'error', text: result.message })
                      setTimeout(() => setMessage(null), 3000)
                    }
                    setIsTogglingAdmin(false)
                  }}
                  disabled={isOwnAccount || isTogglingAdmin}
                >
                  {user.canManageAdmins ? (
                    <><Crown className="mr-2 h-4 w-4 text-orange-500" /><span>Revoke Super Admin</span></>
                  ) : (
                    <><Crown className="mr-2 h-4 w-4 text-amber-500" /><span>Make Super Admin</span></>
                  )}
                </DropdownMenuItem>
              )}
            </>
          )}

          <DropdownMenuSeparator />
          
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            disabled={isOwnAccount || !!user.canManageAdmins}
            className="text-red-600 dark:text-red-400"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Delete User</span>
            {isOwnAccount && <span className="ml-auto text-xs">Not allowed</span>}
            {!isOwnAccount && user.canManageAdmins && <span className="ml-auto text-xs">Protected</span>}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
