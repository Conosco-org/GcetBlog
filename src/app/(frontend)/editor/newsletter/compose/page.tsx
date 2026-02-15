/**
 * Newsletter Compose Page
 *
 * Create and edit newsletter campaigns (manual or auto-digest).
 */

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { PageHeader } from '@/components/base/PageHeader'
import { ComposeForm } from './ComposeForm'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ id?: string; mode?: 'edit' | 'create' }>
}

export default async function ComposePage({ searchParams }: PageProps) {
  const params = await searchParams
  const newsletterId = params.id
  const mode = params.mode || 'create'

  const payload = await getPayload({ config: configPromise })

  // Fetch existing newsletter if editing
  let newsletter = null
  if (newsletterId && mode === 'edit') {
    try {
      newsletter = await payload.findByID({
        collection: 'newsletters',
        id: newsletterId,
        depth: 1,
      })
    } catch {
      notFound()
    }
  }

  // Fetch categories and posts for reference
  const [categories, recentPosts] = await Promise.all([
    payload.find({
      collection: 'categories',
      limit: 50,
      sort: 'title',
      depth: 0,
    }),

    payload.find({
      collection: 'posts',
      limit: 20,
      sort: '-publishedAt',
      where: { _status: { equals: 'published' } },
      depth: 0,
    }),
  ])

  return (
    <div className="p-8 min-h-screen max-w-5xl mx-auto">
      <PageHeader
        title={mode === 'edit' ? 'Edit Campaign' : 'Create Newsletter Campaign'}
        description={
          mode === 'edit'
            ? 'Update your newsletter content and settings'
            : 'Create a new email campaign for your subscribers'
        }
      />

      <ComposeForm
        newsletter={newsletter}
        categories={categories.docs}
        recentPosts={recentPosts.docs}
        mode={mode}
      />
    </div>
  )
}
