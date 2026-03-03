/**
 * Cached Data Access Layer — Conosco API
 *
 * Wraps all Conosco API calls with Next.js unstable_cache for ISR/SSG.
 * Each function uses tag-based invalidation so we can revalidate
 * specific data without clearing everything.
 *
 * Cache TTLs: 5min events, 10min clubs, 15min stats
 * Tags: 'conosco-events', 'conosco-clubs', 'conosco-stats'
 */

import { unstable_cache } from 'next/cache'
import type {
  ConoscoApiResponse,
  PublicEvent,
  PublicClub,
  EventStats,
  ClubStats,
  EventQueryParams,
  ClubQueryParams,
  ProviderHealth,
} from './types'
import { DEFAULT_CACHE_TTLS } from './types'
import { createConoscoProvider } from './factory'

// ---------------------------------------------------------------------------
// Lazy provider getter (avoids import-time side effects)
// ---------------------------------------------------------------------------

function getProvider() {
  return createConoscoProvider()
}

// ---------------------------------------------------------------------------
// Cache Tags (for revalidateTag())
// ---------------------------------------------------------------------------

export const CONOSCO_CACHE_TAGS = {
  events: 'conosco-events',
  clubs: 'conosco-clubs',
  stats: 'conosco-stats',
  health: 'conosco-health',
} as const

// ---------------------------------------------------------------------------
// Events — Cached
// ---------------------------------------------------------------------------

export async function getCachedEvents(
  params?: EventQueryParams,
): Promise<ConoscoApiResponse<PublicEvent[]>> {
  const cacheKey = `conosco-events-${JSON.stringify(params ?? {})}`
  const cachedFn = unstable_cache(
    async () => {
      const provider = getProvider()
      return provider.getEvents(params)
    },
    [cacheKey],
    {
      revalidate: DEFAULT_CACHE_TTLS.events,
      tags: [CONOSCO_CACHE_TAGS.events],
    },
  )
  return cachedFn()
}

export async function getCachedUpcomingEvents(
  params?: EventQueryParams,
): Promise<ConoscoApiResponse<PublicEvent[]>> {
  const cacheKey = `conosco-upcoming-${JSON.stringify(params ?? {})}`
  const cachedFn = unstable_cache(
    async () => {
      const provider = getProvider()
      return provider.getUpcomingEvents(params)
    },
    [cacheKey],
    {
      revalidate: DEFAULT_CACHE_TTLS.events,
      tags: [CONOSCO_CACHE_TAGS.events],
    },
  )
  return cachedFn()
}

export async function getCachedRecentEvents(
  params?: EventQueryParams,
): Promise<ConoscoApiResponse<PublicEvent[]>> {
  const cacheKey = `conosco-recent-${JSON.stringify(params ?? {})}`
  const cachedFn = unstable_cache(
    async () => {
      const provider = getProvider()
      return provider.getRecentEvents(params)
    },
    [cacheKey],
    {
      revalidate: DEFAULT_CACHE_TTLS.events,
      tags: [CONOSCO_CACHE_TAGS.events],
    },
  )
  return cachedFn()
}

export async function getCachedEvent(
  eventCode: string,
): Promise<ConoscoApiResponse<PublicEvent>> {
  const cachedFn = unstable_cache(
    async () => {
      const provider = getProvider()
      return provider.getEvent(eventCode)
    },
    [`conosco-event-${eventCode}`],
    {
      revalidate: DEFAULT_CACHE_TTLS.events,
      tags: [CONOSCO_CACHE_TAGS.events],
    },
  )
  return cachedFn()
}

export async function getCachedEventStats(): Promise<ConoscoApiResponse<EventStats>> {
  const cachedFn = unstable_cache(
    async () => {
      const provider = getProvider()
      return provider.getEventStats()
    },
    ['conosco-event-stats'],
    {
      revalidate: DEFAULT_CACHE_TTLS.stats,
      tags: [CONOSCO_CACHE_TAGS.stats],
    },
  )
  return cachedFn()
}

// ---------------------------------------------------------------------------
// Clubs — Cached
// ---------------------------------------------------------------------------

export async function getCachedClubs(
  params?: ClubQueryParams,
): Promise<ConoscoApiResponse<PublicClub[]>> {
  const cacheKey = `conosco-clubs-${JSON.stringify(params ?? {})}`
  const cachedFn = unstable_cache(
    async () => {
      const provider = getProvider()
      return provider.getClubs(params)
    },
    [cacheKey],
    {
      revalidate: DEFAULT_CACHE_TTLS.clubs,
      tags: [CONOSCO_CACHE_TAGS.clubs],
    },
  )
  return cachedFn()
}

export async function getCachedClub(
  clubCode: string,
): Promise<ConoscoApiResponse<PublicClub>> {
  const cachedFn = unstable_cache(
    async () => {
      const provider = getProvider()
      return provider.getClub(clubCode)
    },
    [`conosco-club-${clubCode}`],
    {
      revalidate: DEFAULT_CACHE_TTLS.clubs,
      tags: [CONOSCO_CACHE_TAGS.clubs],
    },
  )
  return cachedFn()
}

export async function getCachedClubsByClassification(
  classification: string,
  params?: ClubQueryParams,
): Promise<ConoscoApiResponse<PublicClub[]>> {
  const cacheKey = `conosco-clubs-class-${classification}-${JSON.stringify(params ?? {})}`
  const cachedFn = unstable_cache(
    async () => {
      const provider = getProvider()
      return provider.getClubsByClassification(classification, params)
    },
    [cacheKey],
    {
      revalidate: DEFAULT_CACHE_TTLS.clubs,
      tags: [CONOSCO_CACHE_TAGS.clubs],
    },
  )
  return cachedFn()
}

export async function getCachedClubStats(): Promise<ConoscoApiResponse<ClubStats>> {
  const cachedFn = unstable_cache(
    async () => {
      const provider = getProvider()
      return provider.getClubStats()
    },
    ['conosco-club-stats'],
    {
      revalidate: DEFAULT_CACHE_TTLS.stats,
      tags: [CONOSCO_CACHE_TAGS.stats],
    },
  )
  return cachedFn()
}

// ---------------------------------------------------------------------------
// Health — Cached (short TTL)
// ---------------------------------------------------------------------------

export async function getCachedProviderHealth(): Promise<ProviderHealth> {
  const cachedFn = unstable_cache(
    async () => {
      const provider = getProvider()
      return provider.healthCheck()
    },
    ['conosco-health'],
    {
      revalidate: 60, // 1 minute
      tags: [CONOSCO_CACHE_TAGS.health],
    },
  )
  return cachedFn()
}
