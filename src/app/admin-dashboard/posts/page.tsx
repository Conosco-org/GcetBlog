import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { FileText, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { User } from '@/payload-types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminPostsPage() {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) {
    redirect('/login')
  }
  if ((user as User).role !== 'admin') {
    redirect('/admin-dashboard')
  }

  // Fetch all posts
  const allPosts = await payload.find({
    collection: 'posts',
    sort: '-createdAt',
    limit: 50,
    depth: 2,
    draft: true,
  })

  // Stats
  const [publishedCount, draftCount, pendingCount] = await Promise.all([
    payload.find({
      collection: 'posts',
      where: { _status: { equals: 'published' } },
      limit: 0,
    }),
    payload.find({
      collection: 'posts',
      where: { _status: { equals: 'draft' } },
      limit: 0,
    }),
    payload.find({
      collection: 'posts',
      where: { reviewStatus: { equals: 'pending_review' } },
      limit: 0,
    }),
  ])

  const getStatusBadge = (status: string | undefined, reviewStatus: string | undefined) => {
    if (status === 'published') {
      return <Badge variant="default" className="bg-green-600">Published</Badge>
    }
    if (reviewStatus === 'pending_review') {
      return <Badge variant="secondary" className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30">Pending Review</Badge>
    }
    if (reviewStatus === 'rejected') {
      return <Badge variant="destructive">Rejected</Badge>
    }
    return <Badge variant="secondary">Draft</Badge>
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">All Posts</h1>
        <p className="text-muted-foreground mt-1">
          Manage all content across the platform
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{publishedCount.totalDocs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">{draftCount.totalDocs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{pendingCount.totalDocs}</div>
          </CardContent>
        </Card>
      </div>

      {/* Posts Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            All Posts
          </CardTitle>
          <CardDescription>
            Showing {allPosts.docs.length} of {allPosts.totalDocs} posts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allPosts.docs.map((post) => {
                const author = Array.isArray(post.authors) && post.authors.length > 0 && typeof post.authors[0] === 'object'
                  ? post.authors[0]
                  : null
                const category = Array.isArray(post.categories) && post.categories.length > 0 && typeof post.categories[0] === 'object'
                  ? post.categories[0].title
                  : 'Uncategorized'

                return (
                  <TableRow key={post.id}>
                    <TableCell>
                      <p className="font-medium truncate max-w-[200px]">{post.title}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                          {(author?.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm text-muted-foreground">{author?.name || 'Unknown'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{category}</Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(post._status ?? undefined, post.reviewStatus ?? undefined)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {post.slug && post._status === 'published' && (
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/posts/${post.slug}`} target="_blank">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Link>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {allPosts.totalDocs === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No posts found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
