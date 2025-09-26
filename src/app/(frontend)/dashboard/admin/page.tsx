import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ContributorApplyForm } from '../ContributorApplyForm'
import { AdminRoleRequestsList } from './AdminRoleRequestsList'
import type { User } from '@/payload-types'

export default async function AdminDashboardPage() {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()

  // Authenticate the request
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) {
    redirect('/admin/login')
  }

  const typedUser = user as User & { role: string }

  // Check for existing pending requests for current user
  const existingRequest = await payload.find({
    collection: 'role-upgrade-requests',
    where: {
      and: [{ user: { equals: user.id } }, { status: { equals: 'pending' } }],
    },
  })

  // Get all pending requests for admin view
  const allPendingRequests =
    typedUser.role === 'admin'
      ? await payload.find({
          collection: 'role-upgrade-requests',
          where: {
            status: { equals: 'pending' },
          },
          depth: 1, // This will populate the user relationship
          sort: '-createdAt',
        })
      : null

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Current role: <span className="font-medium capitalize">{typedUser.role}</span>
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Role upgrade form */}
        <div>
          <ContributorApplyForm
            currentRole={typedUser.role}
            hasExistingRequest={existingRequest.docs.length > 0}
          />
        </div>

        {/* Admin controls */}
        {typedUser.role === 'admin' && allPendingRequests && (
          <div>
            <AdminRoleRequestsList requests={allPendingRequests.docs} />
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="p-4 border rounded-lg">
          <h3 className="font-medium mb-2">Content</h3>
          <div className="space-y-2 text-sm">
            <Link href="/admin/collections/posts" className="block text-blue-600 hover:underline">
              Manage Posts
            </Link>
            <Link href="/admin/collections/pages" className="block text-blue-600 hover:underline">
              Manage Pages
            </Link>
          </div>
        </div>

        <div className="p-4 border rounded-lg">
          <h3 className="font-medium mb-2">Media</h3>
          <div className="space-y-2 text-sm">
            <Link href="/admin/collections/media" className="block text-blue-600 hover:underline">
              Media Library
            </Link>
          </div>
        </div>

        {(typedUser.role === 'admin' || typedUser.role === 'editor') && (
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Moderation</h3>
            <div className="space-y-2 text-sm">
              <Link href="/editor/queue" className="block text-blue-600 hover:underline">
                Approval Queue
              </Link>
              <Link href="/editor/comments" className="block text-blue-600 hover:underline">
                Moderate Comments
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
