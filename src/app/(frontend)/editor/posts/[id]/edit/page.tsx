import { redirect, notFound } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { PostForm } from '../../create/PostForm'

// Helper to extract plain text from Lexical content
function lexicalToPlainText(content: unknown): string {
  if (!content || typeof content !== 'object' || !('root' in (content as Record<string, unknown>))) {
    return typeof content === 'string' ? content : ''
  }
  const root = (content as { root: { children?: Array<{ children?: Array<{ text?: string }> }> } }).root
  if (!root.children || !Array.isArray(root.children)) return ''
  return root.children
    .map((child) => {
      if (child.children && Array.isArray(child.children)) {
        return child.children.map((textNode) => textNode.text || '').join('')
      }
      return ''
    })
    .filter((text: string) => text.trim())
    .join('\n\n')
}

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const { id } = await params

  // Authenticate the request
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) {
    redirect('/login')
  }

  // Editors, admins, and contributors can edit posts
  if (!['contributor', 'editor', 'admin'].includes(user.role)) {
    redirect('/dashboard')
  }

  // Get the post
  try {
    const post = await payload.findByID({
      collection: 'posts',
      id: id,
      depth: 2,
    })

    if (!post) {
      notFound()
    }

    // Get categories for the form
    const categories = await payload.find({
      collection: 'categories',
      limit: 100,
      sort: 'title',
    })

    // Extract category IDs
    const categoryIds = Array.isArray(post.categories)
      ? post.categories.map(cat => typeof cat === 'object' ? cat.id : cat)
      : []

    // Convert Lexical content to plain text for editing
    const plainTextContent = lexicalToPlainText(post.content)

    return (
      <div className="min-h-screen">
        <div className="max-w-4xl mx-auto p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Edit Post</h1>
            <p className="text-muted-foreground">Update your blog post</p>
          </div>

          <PostForm
            categories={categories.docs}
            user={user}
            postId={post.id}
            isEdit={true}
            initialData={{
              title: post.title,
              content: plainTextContent,
              categories: categoryIds,
              meta: post.meta ? {
                title: typeof post.meta === 'object' && 'title' in post.meta && post.meta.title ? String(post.meta.title) : undefined,
                description: typeof post.meta === 'object' && 'description' in post.meta && post.meta.description ? String(post.meta.description) : undefined,
              } : undefined,
              heroImage: typeof post.heroImage === 'object' && post.heroImage ? post.heroImage.id : (typeof post.heroImage === 'string' ? post.heroImage : undefined),
            }}
          />
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error fetching post:', error)
    notFound()
  }
}
