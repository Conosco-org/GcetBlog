'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import { uploadToCloudinaryDirect } from '@/utilities/uploadToCloudinaryDirect'
import {
  User as UserIcon,
  Mail,
  Lock,
  Save,
  Loader2,
  Camera,
  Calendar,
  Shield,
  AlertTriangle,
  Trash2,
  X,
} from 'lucide-react'

interface UserData {
  id: string
  name: string
  email: string
  role: string
  bio: string | null
  avatar: { url: string; filename: string } | string | null
  createdAt: string
  updatedAt: string
}

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()

  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  // Profile form
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)

  // Email form
  const [email, setEmail] = useState('')
  const [savingEmail, setSavingEmail] = useState(false)

  // Password form
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)

  // Avatar upload
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // Delete account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch('/api/users/me', { credentials: 'include' })
      if (!res.ok) {
        router.push('/login')
        return
      }
      const data = await res.json()
      const userData = data.user || data

      // Fetch full user details from Payload REST API
      const fullRes = await fetch(`/api/users/${userData.id}`, { credentials: 'include' })
      if (fullRes.ok) {
        const fullUser = await fullRes.json()
        setUser(fullUser)
        setName(fullUser.name || '')
        setBio(fullUser.bio || '')
        setEmail(fullUser.email || '')
      } else {
        setUser(userData)
        setName(userData.name || '')
        setBio(userData.bio || '')
        setEmail(userData.email || '')
      }
    } catch {
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return

    setSavingProfile(true)
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, bio }),
      })

      if (res.ok) {
        const updated = await res.json()
        setUser((prev) => prev ? { ...prev, ...updated.doc } : prev)
        toast({ title: 'Profile updated', description: 'Your name and bio have been saved.' })
      } else {
        const err = await res.json().catch(() => ({}))
        toast({ title: 'Error', description: err.message || 'Failed to update profile.', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Network error. Please try again.', variant: 'destructive' })
    } finally {
      setSavingProfile(false)
    }
  }

  async function handleSaveEmail(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    if (email === user.email) {
      toast({ title: 'No changes', description: 'Email is the same as current.' })
      return
    }

    setSavingEmail(true)
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      })

      if (res.ok) {
        const updated = await res.json()
        setUser((prev) => prev ? { ...prev, ...updated.doc } : prev)
        toast({ title: 'Email updated', description: 'Your email has been changed.' })
      } else {
        const err = await res.json().catch(() => ({}))
        toast({
          title: 'Error',
          description: err.errors?.[0]?.message || err.message || 'Failed to update email.',
          variant: 'destructive',
        })
      }
    } catch {
      toast({ title: 'Error', description: 'Network error. Please try again.', variant: 'destructive' })
    } finally {
      setSavingEmail(false)
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return

    if (newPassword.length < 6) {
      toast({ title: 'Error', description: 'Password must be at least 6 characters.', variant: 'destructive' })
      return
    }
    if (newPassword !== confirmPassword) {
      toast({ title: 'Error', description: 'Passwords do not match.', variant: 'destructive' })
      return
    }

    setSavingPassword(true)
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password: newPassword }),
      })

      if (res.ok) {
        setNewPassword('')
        setConfirmPassword('')
        toast({ title: 'Password changed', description: 'Your password has been updated.' })
      } else {
        const err = await res.json().catch(() => ({}))
        toast({
          title: 'Error',
          description: err.errors?.[0]?.message || err.message || 'Failed to change password.',
          variant: 'destructive',
        })
      }
    } catch {
      toast({ title: 'Error', description: 'Network error. Please try again.', variant: 'destructive' })
    } finally {
      setSavingPassword(false)
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Error', description: 'Please select an image file.', variant: 'destructive' })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Error', description: 'Image must be under 5MB.', variant: 'destructive' })
      return
    }

    setUploadingAvatar(true)
    try {
      const uploaded = await uploadToCloudinaryDirect(file, `${user.name}'s avatar`)

      // Update user avatar field
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ avatar: uploaded.id }),
      })

      if (res.ok) {
        const updated = await res.json()
        setUser((prev) => prev ? { ...prev, ...updated.doc } : prev)
        toast({ title: 'Avatar updated', description: 'Your profile picture has been changed.' })
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to upload avatar.', variant: 'destructive' })
    } finally {
      setUploadingAvatar(false)
    }
  }

  async function handleDeleteAccount() {
    if (!user || deleteConfirmText !== 'DELETE') return

    setDeleting(true)
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (res.ok) {
        toast({ title: 'Account deleted', description: 'Your account has been removed.' })
        await fetch('/api/auth/logout', { method: 'POST' })
        router.push('/')
      } else {
        const err = await res.json().catch(() => ({}))
        toast({
          title: 'Cannot delete account',
          description: err.errors?.[0]?.message || 'Only admins can delete accounts. Contact an administrator.',
          variant: 'destructive',
        })
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to delete account.', variant: 'destructive' })
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
      setDeleteConfirmText('')
    }
  }

  function getAvatarUrl(): string | undefined {
    if (!user?.avatar) return undefined
    if (typeof user.avatar === 'string') return undefined
    return user.avatar.url
  }

  function getInitials(): string {
    return (user?.name || user?.email || 'U')
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile & Account</h1>
        <p className="text-muted-foreground">Manage your personal information and account settings.</p>
      </div>

      {/* Avatar & Info Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="relative group">
              <Avatar className="h-24 w-24">
                <AvatarImage src={getAvatarUrl()} alt={user.name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-semibold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <label
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                aria-label="Change avatar"
              >
                {uploadingAvatar ? (
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                ) : (
                  <Camera className="h-6 w-6 text-white" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                />
              </label>
            </div>

            {/* Quick Info */}
            <div className="flex-1 text-center sm:text-left space-y-1">
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="flex items-center gap-2 justify-center sm:justify-start mt-2">
                <Badge variant="secondary" className="capitalize">
                  <Shield className="h-3 w-3 mr-1" />
                  {user.role}
                </Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Joined {new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                </span>
              </div>
              {user.bio && (
                <p className="text-sm text-muted-foreground mt-2 italic">&ldquo;{user.bio}&rdquo;</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserIcon className="h-5 w-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Write a short bio about yourself..."
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                This appears on your author page and post bylines.
              </p>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={savingProfile} title="Save Profile" aria-label="Save Profile">
                {savingProfile ? <Loader2 className="h-4 w-4 sm:mr-2 animate-spin" /> : <Save className="h-4 w-4 sm:mr-2" />}
                <span className="hidden sm:inline">Save Profile</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Email */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mail className="h-5 w-5" />
            Email Address
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveEmail} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={savingEmail} title="Update Email" aria-label="Update Email">
                {savingEmail ? <Loader2 className="h-4 w-4 sm:mr-2 animate-spin" /> : <Save className="h-4 w-4 sm:mr-2" />}
                <span className="hidden sm:inline">Update Email</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lock className="h-5 w-5" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                minLength={6}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={savingPassword} title="Change Password" aria-label="Change Password">
                {savingPassword ? <Loader2 className="h-4 w-4 sm:mr-2 animate-spin" /> : <Lock className="h-4 w-4 sm:mr-2" />}
                <span className="hidden sm:inline">Change Password</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-medium">Delete Account</p>
              <p className="text-sm text-muted-foreground">
                Permanently remove your account and all associated data. This action cannot be undone.
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
              className="shrink-0"
              title="Delete Account"
              aria-label="Delete Account"
            >
              <Trash2 className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Delete Account</span>
            </Button>
          </div>

          {showDeleteConfirm && (
            <div className="mt-4 p-4 border border-destructive/50 rounded-lg bg-destructive/5 space-y-3">
              <p className="text-sm font-medium">
                Type <span className="font-mono font-bold">DELETE</span> to confirm:
              </p>
              <Input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE"
                className="max-w-xs"
                aria-label="Confirm deletion"
              />
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={deleteConfirmText !== 'DELETE' || deleting}
                  onClick={handleDeleteAccount}
                  title="Confirm Delete"
                  aria-label="Confirm Delete"
                >
                  {deleting ? <Loader2 className="h-4 w-4 sm:mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 sm:mr-2" />}
                  <span className="hidden sm:inline">{deleting ? 'Deleting...' : 'Confirm Delete'}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setDeleteConfirmText('')
                  }}
                  title="Cancel"
                  aria-label="Cancel"
                >
                  <X className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Cancel</span>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
