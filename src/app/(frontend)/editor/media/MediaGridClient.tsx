'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import type { Media } from '@/shared/types/payload-types'
import { SearchInput } from '@frontend/components/base/SearchInput'
import { FilterBar } from '@frontend/components/base/FilterBar'
import { EmptyState } from '@frontend/components/base/EmptyState'
import { Button } from '@frontend/components/ui/button'
import { Input } from '@/frontend/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/frontend/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/frontend/components/ui/select'
import { useToast } from '@frontend/components/ui/use-toast'
import { uploadToCloudinaryDirect } from '@backend/lib/upload-to-cloudinary-direct'
import {
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Pencil,
  Upload,
  Check,
  Copy,
  Loader2,
  X,
} from 'lucide-react'

interface MediaGridClientProps {
  media: Media[]
  totalPages: number
  currentPage: number
  totalItems: number
  pageSize: number
  query: string
  sortParam: string
  users: Array<{ id: string; name: string; email: string }>
  userFilter: string
}

export function MediaGridClient({
  media,
  totalPages,
  currentPage,
  totalItems,
  pageSize,
  query,
  users,
  userFilter,
}: MediaGridClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [deleteTarget, setDeleteTarget] = useState<Media | null>(null)
  const [editTarget, setEditTarget] = useState<Media | null>(null)
  const [editAlt, setEditAlt] = useState('')
  const [isDeleting, startDeleteTransition] = useTransition()
  const [isEditing, startEditTransition] = useTransition()
  const [isUploading, setIsUploading] = useState(false)

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (page > 1) {
      params.set('page', page.toString())
    } else {
      params.delete('page')
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleUserFilterChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all') {
      params.set('user', value)
    } else {
      params.delete('user')
    }
    params.delete('page') // Reset to page 1 when filtering
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    startDeleteTransition(async () => {
      try {
        const res = await fetch(`/api/media/${deleteTarget.id}`, { method: 'DELETE' })
        if (res.ok) {
          toast({ title: 'Deleted', description: `${deleteTarget.filename || 'File'} was deleted.` })
          setDeleteTarget(null)
          router.refresh()
        } else {
          const data = await res.json()
          toast({ title: 'Error', description: data.message || 'Failed to delete', variant: 'destructive' })
        }
      } catch {
        toast({ title: 'Error', description: 'Network error', variant: 'destructive' })
      }
    })
  }

  const handleEditAlt = () => {
    if (!editTarget) return
    startEditTransition(async () => {
      try {
        const res = await fetch(`/api/media/${editTarget.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ alt: editAlt }),
        })
        if (res.ok) {
          toast({ title: 'Updated', description: 'Alt text updated successfully.' })
          setEditTarget(null)
          router.refresh()
        } else {
          const data = await res.json()
          toast({ title: 'Error', description: data.message || 'Failed to update', variant: 'destructive' })
        }
      } catch {
        toast({ title: 'Error', description: 'Network error', variant: 'destructive' })
      }
    })
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    let successCount = 0
    let failCount = 0

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) {
        failCount++
        continue
      }
      try {
        await uploadToCloudinaryDirect(file)
        successCount++
      } catch {
        failCount++
      }
    }

    setIsUploading(false)
    // Reset input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = ''

    if (successCount > 0) {
      toast({ title: 'Upload complete', description: `${successCount} file(s) uploaded successfully.${failCount > 0 ? ` ${failCount} failed.` : ''}` })
      router.refresh()
    } else {
      toast({ title: 'Upload failed', description: `All ${failCount} file(s) failed to upload.`, variant: 'destructive' })
    }
  }

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      toast({ title: 'Copied', description: 'URL copied to clipboard.' })
    })
  }

  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  return (
    <div className="space-y-4">
      {/* Upload input (hidden) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleUpload}
        aria-label="Upload media files"
      />

      {/* Search + Sort + Upload */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <SearchInput
          placeholder="Search files by name..."
          defaultValue={query}
          paramName="q"
          className="flex-1 max-w-md"
        />
        <Select value={userFilter || 'all'} onValueChange={handleUserFilterChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Users" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name || user.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FilterBar
          filters={[
            {
              paramName: 'sort',
              label: 'Sort',
              options: [
                { label: 'Newest First', value: '' },
                { label: 'Oldest First', value: 'createdAt' },
                { label: 'Name A-Z', value: 'filename' },
                { label: 'Name Z-A', value: '-filename' },
                { label: 'Largest First', value: '-filesize' },
                { label: 'Smallest First', value: 'filesize' },
              ],
            },
          ]}
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          title="Upload Files"
          aria-label="Upload Files"
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 sm:mr-2 animate-spin" />
          ) : (
            <Upload className="w-4 h-4 sm:mr-2" />
          )}
          <span className="hidden sm:inline">{isUploading ? 'Uploading...' : 'Upload Files'}</span>
        </Button>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        {totalItems > 0
          ? `Showing ${startItem}–${endItem} of ${totalItems} files`
          : '0 files'}
      </p>

      {/* Media Grid */}
      {media.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title="No media files found"
          description={
            query
              ? 'Try adjusting your search'
              : 'Upload your first media file to get started'
          }
          action={
            <Button onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Files
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {media.map((item) => (
            <div key={item.id} className="group relative">
              <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-2 relative">
                {item.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.url}
                    alt={item.alt || item.filename || 'Media file'}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                {/* Action overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8"
                    title="Edit alt text"
                    onClick={() => {
                      setEditTarget(item)
                      setEditAlt(item.alt || '')
                    }}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  {item.url && (
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8"
                      title="Copy URL"
                      onClick={() => copyUrl(item.url!)}
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8"
                    title="Delete file"
                    onClick={() => setDeleteTarget(item)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <p className="text-xs font-medium truncate">{item.filename || 'Untitled'}</p>
              <p className="text-xs text-muted-foreground">
                {item.filesize ? `${(item.filesize / 1024).toFixed(1)} KB` : 'Unknown size'}
              </p>
              {item.alt && (
                <p className="text-xs text-muted-foreground truncate" title={item.alt}>
                  Alt: {item.alt}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-xs sm:text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => goToPage(currentPage - 1)}
            >
              <ChevronLeft className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Previous</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => goToPage(currentPage + 1)}
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4 sm:ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Media File</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.filename}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={isDeleting} title="Cancel" aria-label="Cancel">
              <X className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Cancel</span>
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting} title="Delete" aria-label="Delete">
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 sm:mr-2 animate-spin" />
                  <span className="hidden sm:inline">Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Delete</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Alt Text Dialog */}
      <Dialog open={!!editTarget} onOpenChange={() => setEditTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Alt Text</DialogTitle>
            <DialogDescription>
              Update the alt text for &quot;{editTarget?.filename}&quot;. Good alt text improves accessibility and SEO.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {editTarget?.url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={editTarget.url}
                alt={editTarget.alt || 'Preview'}
                className="w-full h-40 object-contain rounded-lg bg-muted mb-4"
              />
            )}
            <Input
              value={editAlt}
              onChange={(e) => setEditAlt(e.target.value)}
              placeholder="Describe this image..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)} disabled={isEditing} title="Cancel" aria-label="Cancel">
              <X className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Cancel</span>
            </Button>
            <Button onClick={handleEditAlt} disabled={isEditing} title="Save" aria-label="Save">
              {isEditing ? (
                <>
                  <Loader2 className="w-4 h-4 sm:mr-2 animate-spin" />
                  <span className="hidden sm:inline">Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Save</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
