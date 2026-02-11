'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search, Filter, MoreVertical, Pencil, MessageSquare, Loader2, Trash2, FileX } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { deletePost, unpublishPost } from './actions'

interface ContentManagerClientProps {
  posts: any
  categories: any
}

export default function ContentManagerClient({ posts, categories }: ContentManagerClientProps) {
  const [feedbackDialog, setFeedbackDialog] = useState<{ open: boolean; post: any | null }>({
    open: false,
    post: null,
  })
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; post: any | null }>({
    open: false,
    post: null,
  })
  const [unpublishDialog, setUnpublishDialog] = useState<{ open: boolean; post: any | null }>({
    open: false,
    post: null,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [feedbackForm, setFeedbackForm] = useState({
    title: '',
    type: 'suggestions' as 'critical' | 'suggestions' | 'praise' | 'questions',
    message: '',
  })
  const { toast } = useToast()
  const router = useRouter()

  const handleSendFeedback = async () => {
    if (!feedbackDialog.post || !feedbackForm.title.trim() || !feedbackForm.message.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    try {
      // Get the post author (contributor)
      const post = feedbackDialog.post
      const contributorId = typeof post.authors === 'object' && post.authors.length > 0 
        ? (typeof post.authors[0] === 'object' ? post.authors[0].id : post.authors[0])
        : null

      if (!contributorId) {
        throw new Error('Cannot find post contributor')
      }

      const response = await fetch('/api/feedback/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: feedbackForm.title,
          postId: post.id,
          contributorId,
          type: feedbackForm.type,
          initialMessage: feedbackForm.message,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send feedback')
      }

      toast({
        title: 'Success',
        description: 'Feedback sent successfully',
      })

      setFeedbackDialog({ open: false, post: null })
      setFeedbackForm({ title: '', type: 'suggestions', message: '' })
    } catch (error) {
      console.error('Error sending feedback:', error)
      toast({
        title: 'Error',
        description: 'Failed to send feedback. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const openFeedbackDialog = (post: any) => {
    setFeedbackDialog({ open: true, post })
    setFeedbackForm({
      title: `Feedback for: ${post.title}`,
      type: 'suggestions',
      message: '',
    })
  }

  const handleDeletePost = async () => {
    if (!deleteDialog.post) return

    setIsLoading(true)
    try {
      const result = await deletePost(deleteDialog.post.id)
      
      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        })
        setDeleteDialog({ open: false, post: null })
        router.refresh()
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete post',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnpublishPost = async () => {
    if (!unpublishDialog.post) return

    setIsLoading(true)
    try {
      const result = await unpublishPost(unpublishDialog.post.id)
      
      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        })
        setUnpublishDialog({ open: false, post: null })
        router.refresh()
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to unpublish post',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'published':
        return 'default'
      case 'draft':
        return 'secondary'
      case 'pending':
        return 'outline'
      case 'rejected':
        return 'destructive'
      case 'scheduled':
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  return (
    <>
      {/* Search and Filters */}
      <div className="bg-card rounded-xl p-6 mb-6 shadow-sm border">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search posts, authors..."
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Select>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Posts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Posts</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.docs.map((category: any) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Content Overview */}
      <div className="bg-card rounded-xl shadow-sm border">
        <div className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Content Overview</h2>
            <p className="text-sm text-muted-foreground">Showing {posts.docs.length} of {posts.totalDocs} posts</p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.docs.map((post: any) => {
                const status = post._status || 'draft'
                const authors = Array.isArray(post.authors) 
                  ? post.authors.map((author: any) => 
                      typeof author === 'object' ? author.name : author
                    ).join(', ') 
                  : 'Unknown'
                const categories = Array.isArray(post.categories)
                  ? post.categories.map((cat: any) => 
                      typeof cat === 'object' ? cat.title : cat
                    ).join(', ')
                  : 'Uncategorized'

                return (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium">
                      <div>
                        <p className="font-semibold">{post.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {post.meta?.description || 'No description'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{authors}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{categories}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(status)}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(post.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/editor/posts/${post.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                        </Link>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Post</DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => openFeedbackDialog(post)}
                              className="flex items-center gap-2"
                            >
                              <MessageSquare className="w-4 h-4" />
                              Send Feedback
                            </DropdownMenuItem>
                            {status === 'published' && (
                              <DropdownMenuItem
                                onClick={() => setUnpublishDialog({ open: true, post })}
                                className="flex items-center gap-2"
                              >
                                <FileX className="w-4 h-4" />
                                Unpublish
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem>Duplicate</DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setDeleteDialog({ open: true, post })}
                              className="text-destructive flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {posts.docs.length} of {posts.totalDocs} posts
          </p>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              size="sm"
              disabled={!posts.hasPrevPage}
            >
              Previous
            </Button>
            <Button 
              variant="outline"
              size="sm"
              disabled={!posts.hasNextPage}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Feedback Dialog */}
      <Dialog 
        open={feedbackDialog.open} 
        onOpenChange={(open) => setFeedbackDialog({ ...feedbackDialog, open })}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Feedback</DialogTitle>
            <DialogDescription>
              Send feedback to the contributor about their post: {feedbackDialog.post?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="feedback-title">Title *</Label>
              <Input
                id="feedback-title"
                value={feedbackForm.title}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, title: e.target.value })}
                placeholder="Enter feedback title"
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="feedback-type">Type *</Label>
              <Select 
                value={feedbackForm.type} 
                onValueChange={(value: any) => setFeedbackForm({ ...feedbackForm, type: value })}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical Issues</SelectItem>
                  <SelectItem value="suggestions">Suggestions</SelectItem>
                  <SelectItem value="praise">Praise</SelectItem>
                  <SelectItem value="questions">Questions</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="feedback-message">Message *</Label>
              <Textarea
                id="feedback-message"
                value={feedbackForm.message}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, message: e.target.value })}
                placeholder="Enter your feedback message..."
                className="min-h-[120px]"
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setFeedbackDialog({ open: false, post: null })}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleSendFeedback} disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Send Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={deleteDialog.open} 
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the post &ldquo;{deleteDialog.post?.title}&rdquo;.
              {deleteDialog.post?._status === 'published' && (
                <span className="block mt-2 text-orange-600 font-medium">
                  Note: This post is currently published. It will be unpublished before deletion.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDeletePost()
              }}
              disabled={isLoading}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete Post
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unpublish Confirmation Dialog */}
      <AlertDialog 
        open={unpublishDialog.open} 
        onOpenChange={(open) => setUnpublishDialog({ ...unpublishDialog, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unpublish Post?</AlertDialogTitle>
            <AlertDialogDescription>
              This will change the status of &ldquo;{unpublishDialog.post?.title}&rdquo; from published to draft.
              The post will no longer be visible on the public website until it&apos;s published again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleUnpublishPost()
              }}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Unpublish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}