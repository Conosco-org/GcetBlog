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
import { changeUserRole, deleteUser, toggleAdminStatus, toggleCanManageAdmins } from './actions'

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
  const [isChangingRole, setIsChangingRole] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isTogglingAdmin, setIsTogglingAdmin] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const isOwnAccount = user.id === currentUserId
  const isSuperAdmin = user.role === 'superadmin'
  const isInstAdmin = user.roleAssignments?.some(a => a.assignedRole === 'institution_admin') ?? false
  const hasBlogEditor = user.roleAssignments?.some(a => a.assignedRole === 'blog_editor') ?? false
  const hasBlogAuthor = user.roleAssignments?.some(a => a.assignedRole === 'blog_author') ?? false

  const handleRoleChange = async (assignedRole: string, action: 'add' | 'remove') => {
    setIsChangingRole(true)
    const result = await changeUserRole(user.id, assignedRole, action)
    
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
          <DropdownMenuLabel>Assign Roles</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem
            onClick={() => handleRoleChange('blog_editor', hasBlogEditor ? 'remove' : 'add')}
            disabled={isOwnAccount || isSuperAdmin || isChangingRole}
          >
            <UserCog className="mr-2 h-4 w-4 text-blue-500" />
            <span>{hasBlogEditor ? 'Remove Blog Editor' : 'Add Blog Editor'}</span>
            {hasBlogEditor && <span className="ml-auto text-xs">Active</span>}
          </DropdownMenuItem>
          
          <DropdownMenuItem
            onClick={() => handleRoleChange('blog_author', hasBlogAuthor ? 'remove' : 'add')}
            disabled={isOwnAccount || isSuperAdmin || isChangingRole}
          >
            <Users className="mr-2 h-4 w-4 text-green-500" />
            <span>{hasBlogAuthor ? 'Remove Blog Author' : 'Add Blog Author'}</span>
            {hasBlogAuthor && <span className="ml-auto text-xs">Active</span>}
          </DropdownMenuItem>

          {currentUserCanManageAdmins && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Admin Roles</DropdownMenuLabel>
              
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
                disabled={isOwnAccount || isSuperAdmin || isTogglingAdmin}
              >
                {isInstAdmin ? (
                  <><ShieldOff className="mr-2 h-4 w-4 text-orange-500" /><span>Revoke Inst. Admin</span></>
                ) : (
                  <><Shield className="mr-2 h-4 w-4 text-blue-500" /><span>Make Inst. Admin</span></>
                )}
              </DropdownMenuItem>

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
