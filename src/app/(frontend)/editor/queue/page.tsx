import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { EditorQueueList } from './EditorQueueList'
import type { User } from '@/payload-types'

export default async function EditorQueuePage() {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()

  // Authenticate the request
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) {
    redirect('/admin/login')
  }

  const typedUser = user as User & { role: string }

  if (!['editor', 'admin'].includes(typedUser.role)) {
    redirect('/dashboard/admin')
  }

  // Get pending posts (drafts that are ready for review)
  const pendingPosts = await payload.find({
    collection: 'posts',
    where: {
      _status: { equals: 'draft' },
    },
    depth: 2, // Populate relationships
    sort: '-updatedAt',
    limit: 50,
  })

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Editor Queue</h1>
          <p className="text-muted-foreground">Review and approve pending posts</p>
        </div>
        <div className="text-sm text-muted-foreground">{pendingPosts.totalDocs} pending posts</div>
      </div>

      <EditorQueueList posts={pendingPosts.docs} />
    </div>
  )
}
