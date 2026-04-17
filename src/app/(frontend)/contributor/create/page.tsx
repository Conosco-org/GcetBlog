import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import type { User } from '@shared/types/payload-types'
import { CreateContentForm } from '@frontend/features/contributor/components/create-content-form'

export default async function CreateContentPage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>
}) {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) {
    redirect('/login')
  }

  const typedUser = user as User

  if (typedUser.role !== 'contributor') {
    redirect('/dashboard')
  }

  // Fetch categories for the form
  const categoriesData = await payload.find({
    collection: 'categories',
    limit: 100,
    sort: 'title',
  })

  // If a template ID is provided, fetch it
  const params = await searchParams
  let templateData: {
    name: string
    content: string
    suggestedTitle?: string
    suggestedTags?: string[]
    contentType?: string
  } | null = null

  if (params.template) {
    try {
      const template = await payload.findByID({
        collection: 'templates',
        id: params.template,
      })
      if (template) {
        templateData = {
          name: template.name,
          content: template.content,
          suggestedTitle: template.suggestedTitle || undefined,
          suggestedTags: (template.suggestedTags as string[] | null) || undefined,
          contentType: template.contentType || undefined,
        }
        // Increment usage count
        await payload.update({
          collection: 'templates',
          id: params.template,
          data: { usageCount: (template.usageCount || 0) + 1 },
        })
      }
    } catch {
      // Template not found - proceed without it
    }
  }

  return (
    <CreateContentForm
      user={typedUser}
      categories={categoriesData.docs}
      initialTemplate={templateData}
    />
  )
}
