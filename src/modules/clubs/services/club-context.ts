/**
 * Club Context Service — Integration Context Layer
 *
 * Merges CMS (Payload) data with Conosco API data for clubs.
 * Same pattern as event-context.ts.
 */

import { getPayload } from 'payload'
import config from '@payload-config'
import { getCachedClub } from '@/services/conosco/cached'
import type { ClubDisplayData, ClubCardData } from '../types'

// ---------------------------------------------------------------------------
// Get merged club detail by slug
// ---------------------------------------------------------------------------

export async function getClubDisplayData(slug: string): Promise<ClubDisplayData | null> {
  const payload = await getPayload({ config })

  const cmsResult = await payload.find({
    collection: 'clubs',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  })

  const cmsClub = cmsResult.docs[0]
  if (!cmsClub) return null

  // If Conosco-synced, fetch API data
  let conoscoClub = null
  if (cmsClub.dataSource === 'conosco' && cmsClub.conoscoClubCode) {
    try {
      const apiResponse = await getCachedClub(cmsClub.conoscoClubCode)
      conoscoClub = apiResponse.data
    } catch {
      console.warn(`[ClubContext] Failed to fetch Conosco club ${cmsClub.conoscoClubCode}`)
    }
  }

  const heroImage = cmsClub.heroImage as { url?: string } | string | undefined
  const heroImageUrl = typeof heroImage === 'object' && heroImage !== null ? heroImage.url : undefined
  const logoImage = cmsClub.logo as { url?: string } | string | undefined
  const logoUrl = typeof logoImage === 'object' && logoImage !== null ? logoImage.url : undefined

  const manualSocial = cmsClub.socialLinks as Record<string, string> | undefined

  return {
    slug: cmsClub.slug as string,
    title: cmsClub.title,
    editorialDescription: cmsClub.editorialDescription,
    conoscoDescription: conoscoClub?.description,
    dataSource: (cmsClub.dataSource as 'manual' | 'conosco') ?? 'manual',
    conoscoClubCode: cmsClub.conoscoClubCode ?? undefined,

    classification: conoscoClub?.classification ?? cmsClub.classification ?? undefined,
    department: conoscoClub?.department ?? cmsClub.department ?? undefined,
    tags: cmsClub.tags as string[] | undefined,

    status: conoscoClub?.status ?? (cmsClub.manualStatus as 'active' | 'inactive') ?? 'active',

    coordinator: conoscoClub?.coordinator,
    facultyAdvisor: conoscoClub?.facultyAdvisor,
    memberCount: conoscoClub?.memberCount,

    socialLinks: conoscoClub?.socialLinks ?? manualSocial ?? undefined,

    heroImageUrl,
    logoUrl,
    conoscoLogoUrl: conoscoClub?.logoUrl,

    featured: cmsClub.featured ?? false,
    publishedAt: cmsClub.publishedAt ?? undefined,

    theme: (cmsClub as unknown as Record<string, unknown>).theme as ClubDisplayData['theme'],

    meta: cmsClub.meta as ClubDisplayData['meta'],
    cmsId: cmsClub.id as string,

    relatedPostSlugs: Array.isArray(cmsClub.relatedPosts)
      ? cmsClub.relatedPosts.map((p: unknown) => {
          if (typeof p === 'object' && p !== null && 'slug' in p) return (p as { slug: string }).slug
          return null
        }).filter(Boolean) as string[]
      : [],

    recentEvents: conoscoClub?.recentEvents?.map((e) => ({
      eventCode: e.eventCode,
      title: e.title,
      startDate: e.startDate,
      status: e.status,
    })),

    recentAchievements: conoscoClub?.recentAchievements?.map((a) => ({
      title: a.title,
      description: a.description,
      date: a.date,
      category: a.category,
    })),
  }
}

// ---------------------------------------------------------------------------
// Get clubs for listing page
// ---------------------------------------------------------------------------

export async function getClubListingData(params: {
  page?: number
  limit?: number
  department?: string
  classification?: string
  search?: string
}): Promise<{
  clubs: ClubCardData[]
  totalPages: number
  totalDocs: number
  page: number
}> {
  const payload = await getPayload({ config })
  const page = params.page ?? 1
  const limit = params.limit ?? 12

  const where: Record<string, unknown> = { _status: { equals: 'published' } }
  if (params.department) where.department = { equals: params.department }
  if (params.classification) where.classification = { equals: params.classification }
  if (params.search) {
    where.or = [{ title: { like: params.search } }]
  }

  const cmsResult = await payload.find({
    collection: 'clubs',
    where: where as import('payload').Where,
    page,
    limit,
    sort: '-publishedAt',
    depth: 1,
  })

  const clubs: ClubCardData[] = await Promise.all(
    cmsResult.docs.map(async (doc) => {
      let conoscoData = null
      if (doc.dataSource === 'conosco' && doc.conoscoClubCode) {
        try {
          const apiResponse = await getCachedClub(doc.conoscoClubCode)
          conoscoData = apiResponse.data
        } catch {
          // Degrade gracefully
        }
      }

      const heroImage = doc.heroImage as { url?: string } | string | undefined
      const heroImageUrl = typeof heroImage === 'object' && heroImage !== null ? heroImage.url : undefined
      const logoImage = doc.logo as { url?: string } | string | undefined
      const logoUrl = typeof logoImage === 'object' && logoImage !== null ? logoImage.url : undefined

      return {
        slug: doc.slug as string,
        title: doc.title,
        classification: conoscoData?.classification ?? doc.classification ?? undefined,
        department: conoscoData?.department ?? doc.department ?? undefined,
        status: conoscoData?.status ?? (doc.manualStatus as string) ?? 'active',
        logoUrl: logoUrl ?? conoscoData?.logoUrl,
        heroImageUrl,
        featured: doc.featured ?? false,
        dataSource: (doc.dataSource as 'manual' | 'conosco') ?? 'manual',
        memberCount: conoscoData?.memberCount,
      }
    }),
  )

  return {
    clubs,
    totalPages: cmsResult.totalPages,
    totalDocs: cmsResult.totalDocs,
    page: cmsResult.page ?? 1,
  }
}
