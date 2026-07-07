import { getPayload } from 'payload'
import type { Where } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { TemplatesPageClient } from './TemplatesPageClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function TemplatesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>
}) {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) {
    redirect('/login')
  }

  const isAdmin = Boolean((user as unknown as Record<string, unknown>).isAdmin)
  if (user.role !== 'editor' && !isAdmin) {
    redirect('/login')
  }

  const params = await searchParams
  const query = params.q || ''
  const category = params.category || ''
  const page = Math.max(1, Number(params.page) || 1)

  // Build where clause
  const conditions: Where[] = []

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

  const finalWhere: Where | undefined = conditions.length > 0
    ? { and: conditions }
    : undefined

  const templates = await payload.find({
    collection: 'templates',
    page,
    limit: 12,
    sort: '-usageCount',
    where: finalWhere,
  })

  return (
    <TemplatesPageClient
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
        status: (doc.status as 'draft' | 'published') || 'draft',
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      }))}
      totalPages={templates.totalPages}
      currentPage={templates.page || 1}
      totalDocs={templates.totalDocs}
      query={query}
      category={category}
    />
  )
}
