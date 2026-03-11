'use client'

import { useState, useEffect, useCallback, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Shield,
  Plus,
  X,
  Loader2,
  UserCog,
  BookOpen,
  PenTool,
  Calendar,
  MessageSquare,
  Users,
  AlertTriangle,
} from 'lucide-react'
import { assignRole, removeRole, fetchClubsForInstitution } from './actions'

// Role metadata — mirrors permissions.ts but for client use
const ROLE_META: Record<
  string,
  {
    label: string
    description: string
    icon: React.ElementType
    color: string
    needsClub: boolean
  }
> = {
  institution_admin: {
    label: 'Institution Admin',
    description: 'Full control of the institution. Can manage users and assign roles.',
    icon: Shield,
    color: 'text-red-500',
    needsClub: false,
  },
  club_admin: {
    label: 'Club Admin',
    description: 'Full control of a specific club: events, gallery, pages.',
    icon: Users,
    color: 'text-purple-500',
    needsClub: true,
  },
  club_editor: {
    label: 'Club Editor',
    description: 'Create drafts for a club. Cannot publish.',
    icon: PenTool,
    color: 'text-indigo-500',
    needsClub: true,
  },
  blog_editor: {
    label: 'Blog Editor',
    description: 'Manage all blog posts. Can publish, edit, delete.',
    icon: BookOpen,
    color: 'text-blue-500',
    needsClub: false,
  },
  blog_author: {
    label: 'Blog Author',
    description: 'Write blog post drafts. Cannot publish.',
    icon: PenTool,
    color: 'text-green-500',
    needsClub: false,
  },
  event_manager: {
    label: 'Event Manager',
    description: 'Manage events across all clubs.',
    icon: Calendar,
    color: 'text-orange-500',
    needsClub: false,
  },
  moderator: {
    label: 'Moderator',
    description: 'Moderate comments and feedback.',
    icon: MessageSquare,
    color: 'text-yellow-600',
    needsClub: false,
  },
}

interface RoleAssignment {
  assignedRole: string
  scopeType: string
  scopeId?: string | { id: string; relationTo?: string; value?: string | { id: string } } | null
  scopeLabel?: string | null
  id?: string | null
}

interface TargetUser {
  id: string
  name?: string | null
  email?: string | null
  role?: string
  roleAssignments?: RoleAssignment[]
}

interface ClubOption {
  id: string
  title: string
}

interface RoleManagementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  targetUser: TargetUser
  /** Whether the acting user is a superadmin (can assign institution_admin) */
  isSuperAdmin: boolean
}

export function RoleManagementDialog({
  open,
  onOpenChange,
  targetUser,
  isSuperAdmin,
}: RoleManagementDialogProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [clubs, setClubs] = useState<ClubOption[]>([])
  const [loadingClubs, setLoadingClubs] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Add role form state
  const [selectedRole, setSelectedRole] = useState<string>('')
  const [selectedClubId, setSelectedClubId] = useState<string>('')

  const currentAssignments = targetUser.roleAssignments ?? []

  // Determine which roles are available to assign
  const assignableRoles = isSuperAdmin
    ? Object.keys(ROLE_META)
    : Object.keys(ROLE_META).filter((r) => r !== 'institution_admin')

  // Roles not yet assigned (for add dropdown)
  // Club-scoped roles can be assigned multiple times (different clubs), so only filter non-club roles
  const alreadyAssignedNonClubRoles = currentAssignments
    .filter((a) => !ROLE_META[a.assignedRole]?.needsClub)
    .map((a) => a.assignedRole)

  const availableRoles = assignableRoles.filter((r) => {
    if (ROLE_META[r]?.needsClub) return true // Can always add for a new club
    return !alreadyAssignedNonClubRoles.includes(r)
  })

  // Load clubs when dialog opens or when a club-scoped role is selected
  const loadClubs = useCallback(async () => {
    setLoadingClubs(true)
    try {
      const result = await fetchClubsForInstitution()
      if (result.success && result.clubs) {
        setClubs(result.clubs)
      }
    } catch {
      // silently fail
    } finally {
      setLoadingClubs(false)
    }
  }, [])

  useEffect(() => {
    if (open) {
      loadClubs()
    }
  }, [open, loadClubs])

  // Reset form when role selection changes
  useEffect(() => {
    setSelectedClubId('')
  }, [selectedRole])

  const showFlash = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  const handleAssignRole = () => {
    if (!selectedRole) return

    const meta = ROLE_META[selectedRole]
    if (meta?.needsClub && !selectedClubId) return

    // Check for duplicate club-scoped assignment
    if (meta?.needsClub) {
      const duplicate = currentAssignments.find((a) => {
        if (a.assignedRole !== selectedRole) return false
        const existingScopeId =
          typeof a.scopeId === 'string'
            ? a.scopeId
            : a.scopeId && typeof a.scopeId === 'object' && 'id' in a.scopeId
              ? a.scopeId.id
              : null
        return existingScopeId === selectedClubId
      })
      if (duplicate) {
        showFlash('error', `User already has ${meta.label} for this club`)
        return
      }
    }

    const clubLabel = clubs.find((c) => c.id === selectedClubId)?.title

    startTransition(async () => {
      const result = await assignRole(targetUser.id, {
        assignedRole: selectedRole,
        scopeType: meta?.needsClub ? 'club' : selectedRole === 'institution_admin' ? 'institution' : 'institution',
        scopeId: meta?.needsClub ? selectedClubId : undefined,
        scopeLabel: meta?.needsClub ? clubLabel : undefined,
      })

      if (result.success) {
        showFlash('success', result.message)
        setSelectedRole('')
        setSelectedClubId('')
        router.refresh()
      } else {
        showFlash('error', result.message)
      }
    })
  }

  const handleRemoveRole = (assignmentId: string) => {
    startTransition(async () => {
      const result = await removeRole(targetUser.id, assignmentId)
      if (result.success) {
        showFlash('success', result.message)
        router.refresh()
      } else {
        showFlash('error', result.message)
      }
    })
  }

  const selectedMeta = selectedRole ? ROLE_META[selectedRole] : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            Manage Roles
          </DialogTitle>
          <DialogDescription>
            Assign or remove roles for{' '}
            <strong>{targetUser.name || targetUser.email}</strong>
          </DialogDescription>
        </DialogHeader>

        {/* Flash message */}
        {message && (
          <div
            className={`p-3 rounded-md text-sm ${
              message.type === 'success'
                ? 'bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20'
                : 'bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Current Roles */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Current Roles
          </h4>

          {currentAssignments.length === 0 ? (
            <div className="py-6 text-center text-muted-foreground text-sm border rounded-lg border-dashed">
              No roles assigned yet
            </div>
          ) : (
            <div className="space-y-2">
              {currentAssignments.map((assignment) => {
                const meta = ROLE_META[assignment.assignedRole]
                if (!meta) return null
                const Icon = meta.icon
                const isInstAdmin = assignment.assignedRole === 'institution_admin'
                // Can't remove institution_admin unless superadmin
                const canRemove = !isInstAdmin || isSuperAdmin

                return (
                  <div
                    key={assignment.id || assignment.assignedRole}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className={`h-4 w-4 flex-shrink-0 ${meta.color}`} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{meta.label}</span>
                          {isInstAdmin && (
                            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                              Admin
                            </Badge>
                          )}
                        </div>
                        {assignment.scopeLabel && (
                          <span className="text-xs text-muted-foreground">
                            Scope: {assignment.scopeLabel}
                          </span>
                        )}
                        {meta.needsClub && !assignment.scopeLabel && (
                          <span className="text-xs text-muted-foreground italic">
                            Club-scoped
                          </span>
                        )}
                      </div>
                    </div>
                    {canRemove && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-red-500"
                        onClick={() => handleRemoveRole(assignment.id || '')}
                        disabled={isPending}
                        aria-label={`Remove ${meta.label} role`}
                      >
                        {isPending ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <X className="h-3 w-3" />
                        )}
                      </Button>
                    )}
                    {!canRemove && (
                      <Badge variant="outline" className="text-[10px]">
                        Superadmin only
                      </Badge>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Add Role */}
        <div className="space-y-3 pt-2 border-t">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Add Role
          </h4>

          {availableRoles.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              All available roles have been assigned.
            </p>
          ) : (
            <div className="space-y-3">
              {/* Role selector */}
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role to assign..." />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((role) => {
                    const meta = ROLE_META[role]
                    if (!meta) return null
                    const Icon = meta.icon
                    return (
                      <SelectItem key={role} value={role}>
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${meta.color}`} />
                          <span>{meta.label}</span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>

              {/* Show description for selected role */}
              {selectedMeta && (
                <p className="text-xs text-muted-foreground px-1">
                  {selectedMeta.description}
                </p>
              )}

              {/* Club selector for club-scoped roles */}
              {selectedMeta?.needsClub && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Select Club
                  </label>
                  {loadingClubs ? (
                    <div className="flex items-center gap-2 p-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading clubs...
                    </div>
                  ) : clubs.length === 0 ? (
                    <div className="flex items-center gap-2 p-2 text-sm text-muted-foreground">
                      <AlertTriangle className="h-4 w-4" />
                      No clubs found in your institution
                    </div>
                  ) : (
                    <Select value={selectedClubId} onValueChange={setSelectedClubId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a club..." />
                      </SelectTrigger>
                      <SelectContent>
                        {clubs.map((club) => (
                          <SelectItem key={club.id} value={club.id}>
                            {club.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}

              {/* Institution admin warning */}
              {selectedRole === 'institution_admin' && (
                <div className="flex items-start gap-2 p-3 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p className="text-xs">
                    This grants <strong>full administrative access</strong> to the institution,
                    including user management and role assignment. Use with caution.
                  </p>
                </div>
              )}

              {/* Assign button */}
              <Button
                onClick={handleAssignRole}
                disabled={
                  isPending ||
                  !selectedRole ||
                  (selectedMeta?.needsClub && !selectedClubId)
                }
                className="w-full"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Assign {selectedMeta?.label || 'Role'}
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
