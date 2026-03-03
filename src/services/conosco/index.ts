/**
 * Conosco Service — Singleton Entry Point
 *
 * Mirrors the email service singleton pattern:
 *   import { getConoscoService } from '@/services/conosco'
 *   const conosco = getConoscoService()
 *   const events = await conosco.provider.getEvents()
 *
 * Also exports the cached layer for use in server components.
 */

import type { ExternalDataProvider, ProviderHealth } from './types'
import { createConoscoProvider } from './factory'

// Re-export types for convenience
export type {
  ExternalDataProvider,
  ConoscoApiResponse,
  PublicEvent,
  PublicClub,
  EventStats,
  ClubStats,
  EventQueryParams,
  ClubQueryParams,
  ProviderHealth,
  TimeoutConfig,
  CacheTTLConfig,
  PublicVenue,
  PublicOrganizer,
  PublicAchievement,
  PublicCoordinator,
  PublicFacultyAdvisor,
  PublicClubEvent,
  ConoscoPagination,
} from './types'

export { DEFAULT_TIMEOUTS, DEFAULT_CACHE_TTLS } from './types'

// Re-export cached data access
export {
  getCachedEvents,
  getCachedUpcomingEvents,
  getCachedRecentEvents,
  getCachedEvent,
  getCachedEventStats,
  getCachedClubs,
  getCachedClub,
  getCachedClubsByClassification,
  getCachedClubStats,
  getCachedProviderHealth,
} from './cached'

// ---------------------------------------------------------------------------
// Service Interface
// ---------------------------------------------------------------------------

interface ConoscoService {
  /** The underlying provider instance */
  provider: ExternalDataProvider
  /** Quick health check */
  healthCheck(): Promise<ProviderHealth>
  /** Whether the provider is real Conosco (vs disconnected) */
  isConnected: boolean
}

// ---------------------------------------------------------------------------
// Singleton
// ---------------------------------------------------------------------------

let _service: ConoscoService | null = null

export function getConoscoService(): ConoscoService {
  if (_service) return _service

  const provider = createConoscoProvider()

  _service = {
    provider,
    isConnected: provider.name === 'conosco',
    healthCheck: () => provider.healthCheck(),
  }

  return _service
}

/**
 * Reset the singleton — useful for testing or when env vars change.
 */
export function resetConoscoService(): void {
  _service = null
}
