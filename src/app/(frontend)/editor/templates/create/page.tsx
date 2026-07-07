import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { TemplateForm } from '../TemplateForm'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function CreateTemplatePage() {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) {
    redirect('/login')
  }

  const isAdmin = Boolean((user as unknown as Record<string, unknown>).isAdmin)
  if (user.role !== 'editor' && !isAdmin) {
    redirect('/login')
  }

  return <TemplateForm />
}
