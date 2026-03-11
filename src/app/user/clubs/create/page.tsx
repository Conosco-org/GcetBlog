import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { checkPermission } from '@/access/hasPermission'
import { getDepartmentOptions } from '@/custom/departments'
import { ClubForm } from './ClubForm'

export const metadata = {
  title: 'Create Club | GCET Blog',
}

export default async function CreateClubPage() {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()

  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) {
    redirect('/login')
  }

  // Must have club:edit_page permission (club_admin + bypasses)
  if (!checkPermission(user, 'club:edit_page')) {
    redirect('/user')
  }

  const departmentOptions = getDepartmentOptions()

  // Fetch posts for related posts selector
  const postsResult = await payload.find({
    collection: 'posts',
    limit: 200,
    sort: 'title',
    depth: 0,
  })

  const postOptions = postsResult.docs.map((post) => ({
    id: post.id,
    title: typeof post.title === 'string' ? post.title : 'Untitled',
  }))

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Create New Club</h1>
      <ClubForm
        user={{ id: user.id, role: user.role as string }}
        departmentOptions={departmentOptions}
        postOptions={postOptions}
      />
    </div>
  )
}
