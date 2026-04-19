/**
 * Department Context Service
 *
 * Fetches and merges department data from the CMS (Payload).
 * Departments are managed entirely in this CMS (no Conosco sync needed).
 */

import { getPayload } from 'payload'
import config from '@payload-config'
import { getCurrentTenant } from '@/utilities/tenantContext'
import { tenantFind } from '@/utilities/tenantQuery'
import type { DepartmentDisplayData, DepartmentCardData } from '../types'

// ---------------------------------------------------------------------------
// Get department detail by slug
// ---------------------------------------------------------------------------

export async function getDepartmentDisplayData(slug: string): Promise<DepartmentDisplayData | null> {
  const payload = await getPayload({ config })
  const tenant = await getCurrentTenant()

  let result
  if (tenant?.institutionId) {
    result = await tenantFind(payload, 'departments', tenant.institutionId, {
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 1,
    })
  } else {
    // Fallback for super-admin context (no tenant resolution)
    result = await payload.find({
      collection: 'departments',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 1,
    })
  }

  const doc = result.docs[0]
  if (!doc) return null

  const heroImage = doc.heroImage as { url?: string } | string | undefined
  const heroImageUrl = typeof heroImage === 'object' && heroImage !== null ? heroImage.url : undefined
  const logoImage = doc.logo as { url?: string } | string | undefined
  const logoUrl = typeof logoImage === 'object' && logoImage !== null ? logoImage.url : undefined

  return {
    slug: doc.slug as string,
    title: doc.title,
    code: doc.code,
    editorialDescription: doc.editorialDescription as Record<string, unknown> | null,
    shortDescription: doc.shortDescription ?? undefined,
    category: doc.category as DepartmentDisplayData['category'],
    hod: doc.hod as DepartmentDisplayData['hod'],
    facultyCount: doc.facultyCount ?? undefined,
    studentCount: doc.studentCount ?? undefined,
    yearEstablished: doc.yearEstablished ?? undefined,
    socialLinks: doc.socialLinks as DepartmentDisplayData['socialLinks'],
    heroImageUrl,
    logoUrl,
    featured: doc.featured ?? false,
    publishedAt: doc.publishedAt ?? undefined,
    theme: (doc as unknown as Record<string, unknown>).theme as DepartmentDisplayData['theme'],
    meta: doc.meta as DepartmentDisplayData['meta'],
    cmsId: doc.id as string,
    relatedPostSlugs: Array.isArray(doc.relatedPosts)
      ? doc.relatedPosts
          .map((p: unknown) => {
            if (typeof p === 'object' && p !== null && 'slug' in p)
              return (p as { slug: string }).slug
            return null
          })
          .filter(Boolean) as string[]
      : [],
    relatedClubSlugs: Array.isArray(doc.relatedClubs)
      ? doc.relatedClubs
          .map((c: unknown) => {
            if (typeof c === 'object' && c !== null && 'slug' in c)
              return (c as { slug: string }).slug
            return null
          })
          .filter(Boolean) as string[]
      : [],
  }
}

// ---------------------------------------------------------------------------
// Get departments for listing page
// ---------------------------------------------------------------------------

export async function getDepartmentListingData(params: {
  page?: number
  limit?: number
  category?: string
  search?: string
}): Promise<{
  departments: DepartmentCardData[]
  totalPages: number
  totalDocs: number
  page: number
}> {
  const payload = await getPayload({ config })
  const tenant = await getCurrentTenant()
  const page = params.page ?? 1
  const limit = params.limit ?? 12

  const where: Record<string, unknown> = { _status: { equals: 'published' } }
  if (params.category) where.category = { equals: params.category }
  if (params.search) {
    where.or = [
      { title: { like: params.search } },
      { shortDescription: { like: params.search } },
    ]
  }

  let result
  if (tenant?.institutionId) {
    result = await tenantFind(payload, 'departments', tenant.institutionId, {
      where: where as import('payload').Where,
      page,
      limit,
      sort: '-featured,-publishedAt',
      depth: 1,
    })
  } else {
    result = await payload.find({
      collection: 'departments',
      where: where as import('payload').Where,
      page,
      limit,
      sort: '-featured,-publishedAt',
      depth: 1,
    })
  }

  const departments: DepartmentCardData[] = result.docs.map((doc) => {
    const heroImage = doc.heroImage as { url?: string } | string | undefined
    const heroImageUrl =
      typeof heroImage === 'object' && heroImage !== null ? heroImage.url : undefined
    const logoImage = doc.logo as { url?: string } | string | undefined
    const logoUrl =
      typeof logoImage === 'object' && logoImage !== null ? logoImage.url : undefined

    return {
      slug: doc.slug as string,
      title: doc.title,
      code: doc.code,
      shortDescription: doc.shortDescription ?? undefined,
      category: doc.category ?? undefined,
      heroImageUrl,
      logoUrl,
      featured: doc.featured ?? false,
      facultyCount: doc.facultyCount ?? undefined,
      studentCount: doc.studentCount ?? undefined,
    }
  })

  return {
    departments,
    totalPages: result.totalPages,
    totalDocs: result.totalDocs,
    page: result.page ?? 1,
  }
}
