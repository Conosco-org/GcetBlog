import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import { TemplateForm } from '../../TemplateForm'

export default async function EditTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) {
    redirect('/login')
  }

  const hasEditorialAccess =
    (user as unknown as { roleAssignments?: { assignedRole: string }[] }).roleAssignments?.some(
      (a) => ['blog_editor', 'institution_admin'].includes(a.assignedRole)
    )
  if (!hasEditorialAccess) {
    redirect('/user')
  }

  const { id } = await params

  let template
  try {
    template = await payload.findByID({
      collection: 'templates',
      id,
    })
  } catch {
    notFound()
  }

  if (!template) {
    notFound()
  }

  return (
    <TemplateForm
      initialData={{
        id: template.id,
        name: template.name,
        description: template.description || '',
        category: template.category,
        contentType: template.contentType || '',
        audience: template.audience,
        icon: template.icon || 'file-text',
        content: template.content,
        suggestedTitle: template.suggestedTitle || '',
        suggestedTags: (template.suggestedTags as string[]) || [],
        status: (template.status as 'draft' | 'published') || 'draft',
      }}
    />
  )
}
