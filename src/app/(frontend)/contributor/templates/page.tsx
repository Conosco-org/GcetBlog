import { getPayload } from 'payload'
import type { Where } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import type { User } from '@shared/types/payload-types'
import { ContributorTemplatesClient } from '@frontend/features/contributor/components/contributor-templates-client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ContributorTemplatesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>
}) {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) {
    redirect('/login')
  }

  const typedUser = user as User
  if (typedUser.role !== 'contributor') {
    redirect('/dashboard')
  }

  const params = await searchParams
  const query = params.q || ''
  const category = params.category || ''

  // Fetch templates visible to contributors (only published ones)
  const conditions: Where[] = [
    { or: [{ audience: { equals: 'all' } }, { audience: { equals: 'contributor_only' } }] },
    { status: { equals: 'published' } },
  ]

  if (query) {
    conditions.push({
      or: [
        { name: { like: query } },
        { description: { like: query } },
      ],
    })
  }

  if (category) {
    conditions.push({ category: { equals: category } })
  }

  const templates = await payload.find({
    collection: 'templates',
    limit: 50,
    sort: '-usageCount',
    where: { and: conditions },
  })

  return (
    <ContributorTemplatesClient
      templates={templates.docs.map((doc) => ({
        id: doc.id,
        name: doc.name,
        description: doc.description || null,
        category: doc.category,
        contentType: doc.contentType || null,
        audience: doc.audience,
        icon: doc.icon || null,
        usageCount: doc.usageCount || 0,
        content: doc.content,
        suggestedTitle: doc.suggestedTitle || null,
        suggestedTags: (doc.suggestedTags as string[] | null) || null,
      }))}
      query={query}
      category={category}
    />
  )
}
