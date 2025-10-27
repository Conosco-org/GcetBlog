import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import type { User } from '@/payload-types'
import { CreateContentForm } from './CreateContentForm'

export default async function CreateContentPage() {
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

  return <CreateContentForm user={typedUser} categories={categoriesData.docs} />
}
