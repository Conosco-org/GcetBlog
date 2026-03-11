import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { checkPermission } from '@/access/hasPermission'
import { getDepartmentOptions } from '@/custom/departments'
import { EventForm } from './EventForm'

export const metadata = {
  title: 'Create Event | GCET Blog',
}

export default async function CreateEventPage() {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()

  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) {
    redirect('/login')
  }

  // Must have event:create permission
  if (!checkPermission(user, 'event:create')) {
    redirect('/user')
  }

  // Fetch clubs and posts for selectors
  const [departmentOptions, clubsResult, postsResult] = await Promise.all([
    Promise.resolve(getDepartmentOptions()),
    payload.find({
      collection: 'clubs',
      limit: 200,
      sort: 'title',
      depth: 0,
    }),
    payload.find({
      collection: 'posts',
      limit: 200,
      sort: 'title',
      depth: 0,
    }),
  ])

  const clubOptions = clubsResult.docs.map((club) => ({
    id: club.id,
    title: club.title,
  }))

  const postOptions = postsResult.docs.map((post) => ({
    id: post.id,
    title: typeof post.title === 'string' ? post.title : 'Untitled',
  }))

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Create New Event</h1>
      <EventForm
        user={{ id: user.id, role: user.role as string }}
        departmentOptions={departmentOptions}
        clubOptions={clubOptions}
        postOptions={postOptions}
      />
    </div>
  )
}
