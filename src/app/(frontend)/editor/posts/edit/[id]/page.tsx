import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { PostForm } from '../../create/PostForm'
import type { User } from '@/payload-types'

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const payload = await getPayload({ config: configPromise })
  const { id } = await params

  // Get the post
  const post = await payload.findByID({
    collection: 'posts',
    id: id,
    depth: 2,
  })

  if (!post) {
    notFound()
  }

  // Get categories
  const categories = await payload.find({
    collection: 'categories',
    limit: 100,
  })

  // Get current user
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })
  
  if (!user) {
    notFound()
  }

  // Extract category IDs
  const categoryIds = Array.isArray(post.categories) 
    ? post.categories.map(cat => typeof cat === 'string' ? cat : cat.id)
    : []

  // Convert Lexical content to plain text for editing
  let plainTextContent = ''
  if (post.content && typeof post.content === 'object' && 'root' in post.content) {
    const root = post.content.root as any
    if (root.children && Array.isArray(root.children)) {
      plainTextContent = root.children
        .map((child: any) => {
          if (child.children && Array.isArray(child.children)) {
            return child.children
              .map((textNode: any) => textNode.text || '')
              .join('')
          }
          return ''
        })
        .filter((text: string) => text.trim())
        .join('\n\n')
    }
  }

  const initialData = {
    title: post.title,
    content: plainTextContent,
    categories: categoryIds,
    meta: post.meta ? {
      title: typeof post.meta === 'object' && 'title' in post.meta && post.meta.title ? String(post.meta.title) : undefined,
      description: typeof post.meta === 'object' && 'description' in post.meta && post.meta.description ? String(post.meta.description) : undefined,
    } : undefined,
    heroImage: typeof post.heroImage === 'object' && post.heroImage ? post.heroImage.id : (post.heroImage || undefined),
  }

  return (
    <PostForm
      categories={categories.docs}
      user={user as User}
      initialData={initialData}
      postId={post.id}
      isEdit={true}
    />
  )
}
