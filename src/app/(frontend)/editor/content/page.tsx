import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Link from 'next/link'
import { Search, Filter, Plus, MoreVertical, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default async function ContentManagerPage() {
  const payload = await getPayload({ config: configPromise })

  // Get all posts with proper pagination
  const posts = await payload.find({
    collection: 'posts',
    depth: 2, // Populate relationships
    limit: 20,
    sort: '-updatedAt',
  })

  return (
    <div className="p-8 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold">Content Manager</h1>
            <p className="text-muted-foreground">Manage and organize all blog content</p>
          </div>
          <Link href="/editor/posts/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </Button>
          </Link>
        </div>
      </div>

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

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Editor Attribution</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.docs.map((post) => {
                const author = Array.isArray(post.authors) && post.authors.length > 0 && typeof post.authors[0] === 'object' 
                  ? post.authors[0] 
                  : null
                const status = (post._status || 'draft') as string
                const category = Array.isArray(post.categories) && post.categories.length > 0 && typeof post.categories[0] === 'object'
                  ? post.categories[0].title
                  : 'Uncategorized'
                
                return (
                  <TableRow key={post.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium mb-1">{post.title}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                          {(author?.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm">{author?.name || 'Unknown'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {status === 'published' 
                          ? `Published on ${new Date(post.updatedAt).toLocaleDateString()}`
                          : status === 'draft'
                            ? 'Draft - Awaiting submission'
                            : 'Pending review'
                        }
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{category}</Badge>
                    </TableCell>
                    <TableCell>
                      {status === 'published' && <Badge>Published</Badge>}
                      {status === 'draft' && <Badge variant="outline">Draft</Badge>}
                      {status === 'pending' && <Badge variant="secondary">Pending</Badge>}
                      {status === 'rejected' && <Badge variant="destructive">Rejected</Badge>}
                      {status === 'scheduled' && <Badge variant="secondary">Scheduled</Badge>}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(post.updatedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/editor/posts/edit/${post.id}`}>
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
                            <DropdownMenuItem>Duplicate</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
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
    </div>
  )
}
