import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { FileText, Plus, Eye, CheckCircle, Clock } from 'lucide-react'
import type { User, Category } from '@/payload-types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminPostsPage() {
  const payload = await getPayload({ config: configPromise })

  const allPosts = await payload.find({
    collection: 'posts',
    limit: 50,
    sort: '-updatedAt',
    depth: 2,
  })

  const [publishedCount, draftCount, pendingCount] = await Promise.all([
    payload.count({ collection: 'posts', where: { _status: { equals: 'published' } } }),
    payload.count({ collection: 'posts', where: { _status: { equals: 'draft' } } }),
    payload.count({
      collection: 'posts',
      where: { reviewStatus: { equals: 'pending_review' } },
    }),
  ])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Posts</h1>
          <p className="text-muted-foreground mt-1">Manage all content across the platform</p>
        </div>
        <Link href="/editor/posts/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allPosts.totalDocs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publishedCount.totalDocs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{draftCount.totalDocs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Eye className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount.totalDocs}</div>
          </CardContent>
        </Card>
      </div>

      {/* Posts Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Categories</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Review</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allPosts.docs.map((post) => {
                const authors = Array.isArray(post.authors) ? post.authors : []
                const authorName = authors.length > 0
                  ? (typeof authors[0] === 'object' ? (authors[0] as User).name || (authors[0] as User).email : 'Unknown')
                  : 'No author'
                const categories = Array.isArray(post.categories) ? post.categories : []

                return (
                  <TableRow key={post.id}>
                    <TableCell>
                      <Link
                        href={`/editor/posts/${post.id}/edit`}
                        className="font-medium hover:underline"
                      >
                        {post.title || 'Untitled'}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{authorName}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {categories.slice(0, 2).map((cat) => {
                          const category = typeof cat === 'object' ? cat as Category : null
                          return category ? (
                            <Badge key={category.id} variant="outline" className="text-xs">
                              {category.title}
                            </Badge>
                          ) : null
                        })}
                        {categories.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{categories.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={post._status === 'published' ? 'default' : 'secondary'}>
                        {post._status || 'draft'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {post.reviewStatus && (
                        <Badge
                          variant={
                            post.reviewStatus === 'approved'
                              ? 'default'
                              : post.reviewStatus === 'pending_review'
                                ? 'outline'
                                : 'destructive'
                          }
                          className="text-xs"
                        >
                          {post.reviewStatus.replace('_', ' ')}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(post.updatedAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
