import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { PostForm } from '../../create/PostForm'
import { lexicalToHtml } from '@/components/RichTextEditor'
import type { User } from '@/payload-types'

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const { id } = await params

  // Get current user
  const { user } = await payload.auth({ headers: requestHeaders })
  
  if (!user) {
    redirect('/login')
  }

  // Editors and contributors can edit posts
  if (!user.role || !['contributor', 'editor'].includes(user.role)) {
    redirect('/dashboard')
  }

  // Get the post
  const post = await payload.findByID({
    collection: 'posts',
    id: id,
    depth: 2,
  })

  // Get categories for the form
  const categories = await payload.find({
    collection: 'categories',
    limit: 100,
    sort: 'title',
  })

  // Extract category IDs
  const categoryIds = Array.isArray(post.categories) 
    ? post.categories.map(cat => typeof cat === 'string' ? cat : cat.id)
    : []

  // Convert Lexical content to HTML for the Tiptap editor
  const htmlContent = lexicalToHtml(post.content)

  // Extract hero image URL from populated object
  const heroImageObj = typeof post.heroImage === 'object' && post.heroImage ? post.heroImage : null
  const heroImageUrl = heroImageObj
    ? (heroImageObj as unknown as { cloudinaryUrl?: string; url?: string }).cloudinaryUrl
      || (heroImageObj as unknown as { url?: string }).url
      || undefined
    : undefined

  const initialData = {
    title: post.title,
    content: htmlContent,
    categories: categoryIds,
    meta: post.meta ? {
      title: typeof post.meta === 'object' && 'title' in post.meta && post.meta.title ? String(post.meta.title) : undefined,
      description: typeof post.meta === 'object' && 'description' in post.meta && post.meta.description ? String(post.meta.description) : undefined,
    } : undefined,
    heroImage: heroImageObj ? heroImageObj.id : (typeof post.heroImage === 'string' ? post.heroImage : undefined),
    heroImageUrl,
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Edit Post</h1>
          <p className="text-muted-foreground">Update your blog post</p>
        </div>
        <PostForm
          categories={categories.docs}
          user={user as User}
          initialData={initialData}
          postId={post.id}
          isEdit={true}
        />
      </div>
    </div>
  )
}
