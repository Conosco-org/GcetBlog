import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { checkPermission } from '@/access/hasPermission'
import { PageForm } from './PageForm'

export const metadata = {
  title: 'Create Page | GCET Blog',
}

export default async function CreatePagePage() {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()

  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) {
    redirect('/login')
  }

  // Must have club:edit_page permission (club_admin, institution_admin, superadmin)
  if (!checkPermission(user, 'club:edit_page')) {
    redirect('/user')
  }

  // Fetch clubs for the "Link to Club" selector
  const clubsResult = await payload.find({
    collection: 'clubs',
    limit: 500,
    sort: 'title',
    depth: 0,
    select: { title: true, slug: true },
  })

  const clubOptions = clubsResult.docs.map((club) => ({
    id: club.id,
    title: typeof club.title === 'string' ? club.title : 'Untitled',
    slug: (club.slug as string) || '',
  }))

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Create New Page</h1>
      <PageForm
        user={{ id: user.id, role: user.role as string }}
        clubOptions={clubOptions}
      />
    </div>
  )
}
