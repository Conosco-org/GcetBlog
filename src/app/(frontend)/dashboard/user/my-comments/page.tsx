import { getPayload } from 'payload'
import config from '@payload-config'
import { getMeUser } from '@backend/lib/get-me-user'
import { redirect } from 'next/navigation'
import { MyCommentsView } from './MyCommentsView'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function MyCommentsPage() {
  const { user } = await getMeUser()

  if (!user) {
    redirect('/login')
  }

  const payload = await getPayload({ config })

  // Fetch user's own comments
  const myComments = await payload.find({
    collection: 'comments',
    where: {
      author: { equals: user.id },
    },
    depth: 2,
    limit: 100,
    sort: '-createdAt',
  })

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Comments</h1>
        <p className="text-muted-foreground">Track your comments</p>
      </div>

      <MyCommentsView myComments={myComments.docs} />
    </div>
  )
}
