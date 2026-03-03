/**
 * Event Context Service — Integration Context Layer
 *
 * Merges CMS (Payload) data with Conosco API data per Doctrine Rule 3:
 * "CMS enhances, never overwrites operational truth"
 *
 * Priority:
 * - Dates, status, venue, registration, attendance → Conosco (operational truth)
 * - Hero image, SEO, editorial description, featured → CMS (presentation)
 * - Title → CMS if manually set, else Conosco
 */

import { getPayload } from 'payload'
import config from '@payload-config'
import { getCachedEvent, getCachedUpcomingEvents } from '@/services/conosco/cached'
import type { EventDisplayData, EventCardData } from '../types'

// ---------------------------------------------------------------------------
// Get merged event detail by slug
// ---------------------------------------------------------------------------

export async function getEventDisplayData(slug: string): Promise<EventDisplayData | null> {
  const payload = await getPayload({ config })

  // 1. Find CMS record by slug
  const cmsResult = await payload.find({
    collection: 'events',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  })

  const cmsEvent = cmsResult.docs[0]
  if (!cmsEvent) return null

  // 2. If Conosco-synced, fetch API data
  let conoscoEvent = null
  if (cmsEvent.dataSource === 'conosco' && cmsEvent.conoscoEventCode) {
    try {
      const apiResponse = await getCachedEvent(cmsEvent.conoscoEventCode)
      conoscoEvent = apiResponse.data
    } catch {
      // Conosco unavailable — degrade gracefully
      console.warn(`[EventContext] Failed to fetch Conosco event ${cmsEvent.conoscoEventCode}`)
    }
  }

  // 3. Merge: Conosco = truth for operations, CMS = truth for presentation
  const heroImage = cmsEvent.heroImage as { url?: string } | string | undefined
  const heroImageUrl = typeof heroImage === 'object' && heroImage !== null ? heroImage.url : undefined

  return {
    slug: cmsEvent.slug as string,
    title: cmsEvent.title,
    editorialDescription: cmsEvent.editorialDescription,
    conoscoDescription: conoscoEvent?.description,
    dataSource: (cmsEvent.dataSource as 'manual' | 'conosco') ?? 'manual',
    conoscoEventCode: cmsEvent.conoscoEventCode ?? undefined,

    eventType: conoscoEvent?.eventType ?? cmsEvent.eventType ?? undefined,
    department: conoscoEvent?.department ?? cmsEvent.department ?? undefined,
    tags: conoscoEvent?.tags ?? (cmsEvent.tags as string[] | undefined),

    // Dates: Conosco is truth, manual fallback
    startDate: conoscoEvent?.startDate ?? cmsEvent.startDate ?? undefined,
    endDate: conoscoEvent?.endDate ?? cmsEvent.endDate ?? undefined,
    registrationDeadline: conoscoEvent?.registrationDeadline,

    // Status: Conosco is truth, manual fallback
    status: conoscoEvent?.status ?? (cmsEvent.manualStatus as EventDisplayData['status']) ?? 'upcoming',

    venue: conoscoEvent?.venue,
    organizer: conoscoEvent?.organizer,
    registration: conoscoEvent?.registration,
    completion: conoscoEvent?.completion,

    // Media: CMS hero > Conosco poster
    heroImageUrl,
    posterUrl: conoscoEvent?.posterUrl,

    featured: cmsEvent.featured ?? false,
    publishedAt: cmsEvent.publishedAt ?? undefined,

    meta: cmsEvent.meta as EventDisplayData['meta'],
    cmsId: cmsEvent.id as string,

    relatedPostSlugs: Array.isArray(cmsEvent.relatedPosts)
      ? cmsEvent.relatedPosts.map((p: unknown) => {
          if (typeof p === 'object' && p !== null && 'slug' in p) return (p as { slug: string }).slug
          return null
        }).filter(Boolean) as string[]
      : [],
  }
}

// ---------------------------------------------------------------------------
// Get events for listing page (CMS + API merge)
// ---------------------------------------------------------------------------

export async function getEventListingData(params: {
  page?: number
  limit?: number
  department?: string
  eventType?: string
  status?: string
  search?: string
}): Promise<{
  events: EventCardData[]
  totalPages: number
  totalDocs: number
  page: number
}> {
  const payload = await getPayload({ config })
  const page = params.page ?? 1
  const limit = params.limit ?? 12

  // Build CMS query
  const where: Record<string, unknown> = { _status: { equals: 'published' } }
  if (params.department) where.department = { equals: params.department }
  if (params.eventType) where.eventType = { equals: params.eventType }
  if (params.search) {
    where.or = [
      { title: { like: params.search } },
    ]
  }

  // Fetch CMS events
  const cmsResult = await payload.find({
    collection: 'events',
    where: where as import('payload').Where,
    page,
    limit,
    sort: '-publishedAt',
    depth: 1,
  })

  // For Conosco events, try to enrich with API data
  const events: EventCardData[] = await Promise.all(
    cmsResult.docs.map(async (doc) => {
      let conoscoData = null
      if (doc.dataSource === 'conosco' && doc.conoscoEventCode) {
        try {
          const apiResponse = await getCachedEvent(doc.conoscoEventCode)
          conoscoData = apiResponse.data
        } catch {
          // Degrade: use CMS data only
        }
      }

      const heroImage = doc.heroImage as { url?: string } | string | undefined
      const heroImageUrl = typeof heroImage === 'object' && heroImage !== null ? heroImage.url : undefined

      return {
        slug: doc.slug as string,
        title: doc.title,
        eventType: conoscoData?.eventType ?? doc.eventType ?? undefined,
        department: conoscoData?.department ?? doc.department ?? undefined,
        status: conoscoData?.status ?? (doc.manualStatus as string) ?? 'upcoming',
        startDate: conoscoData?.startDate ?? doc.startDate ?? undefined,
        endDate: conoscoData?.endDate ?? doc.endDate ?? undefined,
        heroImageUrl,
        posterUrl: conoscoData?.posterUrl,
        featured: doc.featured ?? false,
        dataSource: (doc.dataSource as 'manual' | 'conosco') ?? 'manual',
        registeredCount: conoscoData?.registration?.registeredCount,
        venue: conoscoData?.venue ? { name: conoscoData.venue.name, type: conoscoData.venue.type } : undefined,
      }
    }),
  )

  // Apply status filter post-merge (since status comes from Conosco for synced events)
  const filtered = params.status
    ? events.filter((e) => e.status === params.status)
    : events

  return {
    events: filtered,
    totalPages: cmsResult.totalPages,
    totalDocs: cmsResult.totalDocs,
    page: cmsResult.page ?? 1,
  }
}

// ---------------------------------------------------------------------------
// Get upcoming events (for homepage/sidebar widgets)  
// ---------------------------------------------------------------------------

export async function getUpcomingEventsForDisplay(limit = 5): Promise<EventCardData[]> {
  const payload = await getPayload({ config })

  // Fetch CMS events marked as upcoming
  const cmsResult = await payload.find({
    collection: 'events',
    where: { _status: { equals: 'published' } },
    limit,
    sort: '-publishedAt',
    depth: 1,
  })

  // Also try Conosco upcoming events
  const _conoscoUpcoming: EventCardData[] = []
  try {
    const apiResponse = await getCachedUpcomingEvents({ limit })
    _conoscoUpcoming.push(...apiResponse.data.map((e) => ({
      slug: '', // Will be matched from CMS or generated
      title: e.title,
      eventType: e.eventType,
      department: e.department,
      status: e.status,
      startDate: e.startDate,
      endDate: e.endDate,
      posterUrl: e.posterUrl,
      featured: false,
      dataSource: 'conosco' as const,
      registeredCount: e.registration?.registeredCount,
      venue: e.venue ? { name: e.venue.name, type: e.venue.type } : undefined,
    })))
  } catch {
    // Conosco unavailable
  }

  // Return CMS events (which may include enriched Conosco events)
  const cmsCards: EventCardData[] = cmsResult.docs.map((doc) => {
    const heroImage = doc.heroImage as { url?: string } | string | undefined
    const heroImageUrl = typeof heroImage === 'object' && heroImage !== null ? heroImage.url : undefined

    return {
      slug: doc.slug as string,
      title: doc.title,
      eventType: doc.eventType ?? undefined,
      department: doc.department ?? undefined,
      status: (doc.manualStatus as string) ?? 'upcoming',
      startDate: doc.startDate ?? undefined,
      endDate: doc.endDate ?? undefined,
      heroImageUrl,
      featured: doc.featured ?? false,
      dataSource: (doc.dataSource as 'manual' | 'conosco') ?? 'manual',
    }
  })

  return cmsCards
}
