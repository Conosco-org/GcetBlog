import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { PostForm } from './PostForm'

export default async function CreatePostPage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>
}) {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()

  // Authenticate the request
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) {
    redirect('/login')
  }

  // Editors, contributors, and admins can create posts
  const isAdmin = Boolean((user as unknown as Record<string, unknown>).isAdmin)
  if (!user.role || (!['contributor', 'editor'].includes(user.role) && !isAdmin)) {
    redirect('/dashboard')
  }

  // Get categories for the form
  const categories = await payload.find({
    collection: 'categories',
    limit: 100,
    sort: 'title',
  })

  // If a template ID is provided, fetch it and pre-fill the form
  const params = await searchParams
  let templateData: {
    name: string
    content: string
    suggestedTitle?: string
    suggestedTags?: string[]
  } | undefined

  if (params.template) {
    try {
      const template = await payload.findByID({
        collection: 'templates',
        id: params.template,
      })
      if (template && template.status === 'published') {
        templateData = {
          name: template.name,
          content: template.content,
          suggestedTitle: template.suggestedTitle || undefined,
          suggestedTags: (template.suggestedTags as string[] | null) || undefined,
        }
        // Increment usage count in background
        payload.update({
          collection: 'templates',
          id: params.template,
          data: { usageCount: (template.usageCount || 0) + 1 },
        }).catch(() => { /* non-critical */ })
      }
    } catch {
      // Template not found - proceed without it
    }
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Create New Post</h1>
          <p className="text-muted-foreground">Write and publish a new blog post</p>
        </div>

        <PostForm
          categories={categories.docs}
          user={user}
          initialTemplate={templateData}
        />
      </div>
    </div>
  )
}
