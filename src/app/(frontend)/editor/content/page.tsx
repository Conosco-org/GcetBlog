import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Link from 'next/link'
import { Search, Filter, Plus, MoreVertical, Eye, MessageSquare, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Content Manager</h1>
            <p className="text-gray-600">Manage and organize all blog content</p>
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
      <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search posts, authors..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
              <option>All Posts</option>
              <option>Published</option>
              <option>Draft</option>
              <option>Pending</option>
            </select>
            
            <select className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
              <option>All Categories</option>
              {/* TODO: Fetch real categories from the database */}
            </select>
            
            {/* TODO: Add editor filter when editor tracking is implemented
            <select className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
              <option>All Editors</option>
            </select>
            */}
            
            <button className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2">
              <Filter className="w-4 h-4" />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Content Overview */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Content Overview</h2>
            <p className="text-sm text-gray-600">Showing {posts.docs.length} of {posts.totalDocs} posts</p>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Editor Attribution
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {posts.docs.map((post) => {
                const author = Array.isArray(post.authors) && post.authors.length > 0 && typeof post.authors[0] === 'object' 
                  ? post.authors[0] 
                  : null
                const status = (post._status || 'draft') as string
                const category = Array.isArray(post.categories) && post.categories.length > 0 && typeof post.categories[0] === 'object'
                  ? post.categories[0].title
                  : 'Uncategorized'
                
                return (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-1">{post.title}</p>
                        {/* TODO: Add views and comments count when analytics are implemented
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {post.viewCount || 0} views
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {post.commentCount || 0} comments
                          </span>
                        </div>
                        */}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                          {(author?.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm text-gray-900">{author?.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {/* TODO: Add editor/approver tracking to posts collection
                            For now, showing basic status information */}
                        {status === 'published' 
                          ? `Published on ${new Date(post.updatedAt).toLocaleDateString()}`
                          : status === 'draft'
                            ? 'Draft - Awaiting submission'
                            : 'Pending review'
                        }
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {status === 'published' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Published
                        </span>
                      )}
                      {status === 'draft' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Draft
                        </span>
                      )}
                      {status === 'pending' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          Pending
                        </span>
                      )}
                      {status === 'rejected' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Rejected
                        </span>
                      )}
                      {status === 'scheduled' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Scheduled
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(post.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/editor/posts/edit/${post.id}`}>
                          <Button variant="ghost" size="sm">
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                        </Link>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <MoreVertical className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {posts.docs.length} of {posts.totalDocs} posts
          </p>
          <div className="flex gap-2">
            <button 
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed" 
              disabled={!posts.hasPrevPage}
            >
              Previous
            </button>
            <button 
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!posts.hasNextPage}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
