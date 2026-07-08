import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

import { PageHeader } from '@frontend/components/base/PageHeader'
import { ArchiveManagerClient } from './ArchiveManagerClient'
import { syncLegacyArchivedPosts } from '@backend/archive/service'

export const metadata: Metadata = {
  title: 'Archive',
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ArchivePage() {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) redirect('/login')

  const typedUser = user as { role?: string; isAdmin?: boolean }
  const userRole = typedUser.role
  const isAdmin = userRole === 'admin' || typedUser.isAdmin === true
  const isEditor = userRole === 'editor'
  if (!isAdmin && !isEditor) redirect('/contributor')

  await syncLegacyArchivedPosts(payload)

  const [archivedPosts, archiveConfig] = await Promise.all([
    payload.find({
      collection: 'archived-posts',
      depth: 2,
      limit: 100,
      sort: '-archivedAt',
    }),
    isAdmin
      ? payload.findGlobal({
          slug: 'archive-config',
          depth: 0,
          overrideAccess: true,
        })
      : Promise.resolve(null),
  ])

  const config = archiveConfig
    ? {
        commentDeletionThreshold: archiveConfig.commentDeletionThreshold || 60,
        postArchiveThreshold: archiveConfig.postArchiveThreshold || '60-days',
        autoArchiveEnabled: archiveConfig.autoArchiveEnabled !== false,
        jobSchedule: archiveConfig.jobSchedule || 'daily',
        dryRunEnabled: archiveConfig.dryRunEnabled !== false,
      }
    : null

  return (
    <div className="p-8 min-h-screen">
      <PageHeader
        title="Archive"
        description="Configure review queue retention and manage archived contributor posts"
      />

      <div className="mt-6">
        <ArchiveManagerClient
          archivedPosts={archivedPosts.docs}
          isAdmin={isAdmin}
          config={config}
        />
      </div>
    </div>
  )
}
