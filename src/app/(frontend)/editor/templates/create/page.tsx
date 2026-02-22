import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { TemplateForm } from '../TemplateForm'

export default async function CreateTemplatePage() {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user || user.role !== 'editor') {
    redirect('/login')
  }

  return <TemplateForm />
}
