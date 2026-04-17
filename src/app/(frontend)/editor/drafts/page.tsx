import { getPayload, type Where } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import type { User } from '@shared/types/payload-types'
import { EditorDraftsClient } from './EditorDraftsClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface PageProps {
  searchParams: Promise<{ page?: string; q?: string }>
}

export default async function EditorDraftsPage({ searchParams }: PageProps) {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) {
    redirect('/login')
  }

  const typedUser = user as User & { role: string }
  const isAdmin = Boolean((typedUser as unknown as Record<string, unknown>).isAdmin)

  if (typedUser.role !== 'editor' && !isAdmin) {
    redirect('/dashboard')
  }

  const params = await searchParams
  const page = parseInt(params.page || '1', 10)
  const query = params.q || ''
  const pageSize = 12

  // Build where clause for drafts authored by this editor
  const where: Where = {
    and: [
      { _status: { equals: 'draft' } },
      { authors: { contains: typedUser.id } },
    ],
  }

  // Add search query if provided
  if (query) {
    where.and = [
      ...(where.and as Where[]),
      {
        or: [
          { title: { contains: query } },
          { content: { contains: query } },
        ],
      } as Where,
    ]
  }

  const drafts = await payload.find({
    collection: 'posts',
    where,
    depth: 2,
    limit: pageSize,
    page,
    sort: '-updatedAt',
  })

  return (
    <div className="p-8 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Drafts</h1>
        <p className="text-muted-foreground">Manage your draft posts</p>
      </div>

      <EditorDraftsClient
        drafts={drafts.docs}
        totalPages={drafts.totalPages}
        currentPage={drafts.page || 1}
        totalItems={drafts.totalDocs}
        pageSize={pageSize}
        query={query}
      />
    </div>
  )
}
