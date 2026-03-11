'use client'

import { useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Pencil, Trash2, Loader2, MoreHorizontal, CheckCircle, Pause, Play } from 'lucide-react'
import { deleteInstitution, toggleInstitutionStatus } from '../../actions'

interface InstitutionActionsProps {
  id: string
  name: string
  status: string
}

export function InstitutionActions({ id, name, status }: InstitutionActionsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [actionType, setActionType] = useState<'status' | 'delete' | null>(null)

  function handleStatusChange(newStatus: 'active' | 'trial' | 'suspended') {
    setActionType('status')
    startTransition(async () => {
      await toggleInstitutionStatus(id, newStatus)
      setActionType(null)
      router.refresh()
    })
  }

  function handleDelete() {
    setActionType('delete')
    startTransition(async () => {
      await deleteInstitution(id)
      setActionType(null)
      router.refresh()
    })
  }

  const isChangingStatus = isPending && actionType === 'status'
  const isDeleting = isPending && actionType === 'delete'

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={() => router.push(`/platform/institutions/${id}`)}
        aria-label={`Edit ${name}`}
      >
        <Pencil className="h-3.5 w-3.5" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline" disabled={isPending} aria-label="More actions">
            {isChangingStatus ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <MoreHorizontal className="h-3.5 w-3.5" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {status !== 'active' && (
            <DropdownMenuItem onClick={() => handleStatusChange('active')}>
              <CheckCircle className="h-3.5 w-3.5 mr-2 text-green-600" />
              Activate
            </DropdownMenuItem>
          )}
          {status !== 'trial' && (
            <DropdownMenuItem onClick={() => handleStatusChange('trial')}>
              <Play className="h-3.5 w-3.5 mr-2 text-blue-600" />
              Set to Trial
            </DropdownMenuItem>
          )}
          {status !== 'suspended' && (
            <DropdownMenuItem onClick={() => handleStatusChange('suspended')}>
              <Pause className="h-3.5 w-3.5 mr-2 text-orange-600" />
              Suspend
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => {
              // The AlertDialog trigger handles this
            }}
            disabled
          >
            Delete — use button →
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            disabled={isPending}
            aria-label={`Delete ${name}`}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            {isDeleting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Institution</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{name}</strong>? This action cannot be undone.
              All users and content belonging to this institution will be unlinked.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Institution
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
