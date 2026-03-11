import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { TemplateForm } from '../TemplateForm'

export default async function CreateTemplatePage() {
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

  return <TemplateForm />
}
