import { redirect, notFound } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { lexicalToHtml } from '@/components/shared/RichTextEditor/lexicalToHtml'
import { PostForm } from '@/app/(frontend)/editor/posts/[id]/edit/PostForm'
import type { Post } from '@/payload-types'
import { toISTDateTimeInput } from '@/utilities/dateTimeIST'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ContributorEditPostPage({ params }: PageProps) {
  const { id } = await params
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()

  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) {
    redirect('/login')
  }

  // Only contributors can access this route
  if (user.role !== 'contributor') {
    redirect('/editor/posts/' + id + '/edit')
  }

  // Fetch the post
  let post: Post | null = null
  try {
    post = await payload.findByID({
      collection: 'posts',
      id,
      draft: true,
      depth: 1,
    }) as Post
  } catch {
    notFound()
  }

  if (!post) notFound()

  // Contributors can only edit their own posts
  const authorIds = (post.authors || []).map((a: unknown) =>
    typeof a === 'object' && a !== null && 'id' in a ? String((a as { id: unknown }).id) : String(a)
  )
  if (!authorIds.includes(String(user.id))) {
    redirect('/contributor/drafts')
  }

  // Fetch categories
  const categories = await payload.find({
    collection: 'categories',
    limit: 100,
    sort: 'title',
  })

  // Convert Lexical content back to HTML for the editor
  let contentHtml = ''
  if (post.content) {
    try {
      contentHtml = lexicalToHtml(post.content as Parameters<typeof lexicalToHtml>[0])
    } catch {
      contentHtml = ''
    }
  }

  // Build initialData
  const categoryIds = (post.categories || []).map((c: unknown) =>
    typeof c === 'object' && c !== null && 'id' in c ? String((c as { id: unknown }).id) : String(c)
  )

  const heroImage =
    post.heroImage && typeof post.heroImage === 'object'
      ? { id: String(post.heroImage.id), url: post.heroImage.url || undefined }
      : post.heroImage
        ? { id: String(post.heroImage), url: undefined }
        : null

  const initialData = {
    title: post.title || '',
    content: contentHtml,
    categories: categoryIds,
    tags: (post.tags as string[] | null) || [],
    publishedAt: toISTDateTimeInput(post.publishedAt),
    featuredFrom: toISTDateTimeInput(post.featuredFrom as string | undefined),
    featuredUntil: toISTDateTimeInput(post.featuredUntil as string | undefined),
    meta: {
      title: post.meta?.title || '',
      description: post.meta?.description || '',
    },
    heroImage: heroImage?.id,
    heroImageUrl: heroImage?.url,
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Edit Post</h1>
          <p className="text-muted-foreground">Update your draft and submit for review</p>
        </div>

        <PostForm
          categories={categories.docs}
          user={user}
          initialData={initialData}
          postId={id}
          isEdit={true}
        />
      </div>
    </div>
  )
}
