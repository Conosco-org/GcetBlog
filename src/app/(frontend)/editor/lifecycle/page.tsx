import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

import { PageHeader } from '@frontend/components/base/PageHeader'
import { LifecycleManagerClient } from './LifecycleManagerClient'

export const metadata: Metadata = {
  title: 'Content Lifecycle',
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function LifecyclePage() {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) redirect('/login')

  const userRole = (user as { role?: string }).role
  const isAdmin = userRole === 'admin'
  const isEditor = userRole === 'editor'
  if (!isAdmin && !isEditor) redirect('/contributor')

  const [archivedPosts, lifecycleConfig] = await Promise.all([
    payload.find({
      collection: 'posts',
      where: {
        archivedStatus: {
          equals: 'archived',
        },
      },
      depth: 2,
      draft: true,
      limit: 100,
      sort: '-archivedAt',
    }),
    isAdmin
      ? payload.findGlobal({
          slug: 'lifecycle-config',
          depth: 0,
          overrideAccess: true,
        })
      : Promise.resolve(null),
  ])

  const config = lifecycleConfig
    ? {
        commentDeletionThreshold: lifecycleConfig.commentDeletionThreshold || 60,
        postArchiveThreshold: lifecycleConfig.postArchiveThreshold || '60-days',
        autoArchiveEnabled: lifecycleConfig.autoArchiveEnabled !== false,
        jobSchedule: lifecycleConfig.jobSchedule || 'daily',
        dryRunEnabled: lifecycleConfig.dryRunEnabled !== false,
      }
    : null

  return (
    <div className="p-8 min-h-screen">
      <PageHeader
        title="Content Lifecycle"
        description="Configure review queue retention and manage archived contributor posts"
      />

      <div className="mt-6">
        <LifecycleManagerClient
          archivedPosts={archivedPosts.docs}
          isAdmin={isAdmin}
          config={config}
        />
      </div>
    </div>
  )
}
