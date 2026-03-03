/**
 * Disconnected Provider — Graceful Fallback
 *
 * Used when Conosco API is not configured or unreachable.
 * Returns empty datasets with proper response shapes so the
 * Content Engine works standalone (manual events/clubs only).
 *
 * This is NOT a mock — it returns honest empty data.
 */

import type {
  ExternalDataProvider,
  ConoscoApiResponse,
  PublicEvent,
  PublicClub,
  EventStats,
  ClubStats,
  EventQueryParams,
  ClubQueryParams,
  ProviderHealth,
} from './types'

// ---------------------------------------------------------------------------
// Helper: empty response builder
// ---------------------------------------------------------------------------

function emptyResponse<T>(data: T): ConoscoApiResponse<T> {
  return {
    success: true,
    institution: 'disconnected',
    contractVersion: '0.0.0',
    data,
  }
}

function emptyListResponse<T>(data: T[]): ConoscoApiResponse<T[]> {
  return {
    success: true,
    institution: 'disconnected',
    contractVersion: '0.0.0',
    data,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      pages: 0,
      hasMore: false,
    },
  }
}

// ---------------------------------------------------------------------------
// Disconnected Provider
// ---------------------------------------------------------------------------

export class DisconnectedProvider implements ExternalDataProvider {
  readonly name = 'disconnected'

  async healthCheck(): Promise<ProviderHealth> {
    return {
      healthy: false,
      provider: this.name,
      responseTimeMs: 0,
      error: 'Conosco API not configured. Running in standalone mode.',
    }
  }

  // -- Events --

  async getEvents(_params?: EventQueryParams): Promise<ConoscoApiResponse<PublicEvent[]>> {
    return emptyListResponse<PublicEvent>([])
  }

  async getUpcomingEvents(_params?: EventQueryParams): Promise<ConoscoApiResponse<PublicEvent[]>> {
    return emptyListResponse<PublicEvent>([])
  }

  async getRecentEvents(_params?: EventQueryParams): Promise<ConoscoApiResponse<PublicEvent[]>> {
    return emptyListResponse<PublicEvent>([])
  }

  async getEvent(_eventCode: string): Promise<ConoscoApiResponse<PublicEvent>> {
    throw new Error('Event not found (Conosco not connected)')
  }

  async getEventStats(): Promise<ConoscoApiResponse<EventStats>> {
    return emptyResponse<EventStats>({
      total: 0,
      upcoming: 0,
      ongoing: 0,
      completed: 0,
      cancelled: 0,
      totalParticipants: 0,
      byType: {},
      byDepartment: {},
    })
  }

  // -- Clubs --

  async getClubs(_params?: ClubQueryParams): Promise<ConoscoApiResponse<PublicClub[]>> {
    return emptyListResponse<PublicClub>([])
  }

  async getClub(_clubCode: string): Promise<ConoscoApiResponse<PublicClub>> {
    throw new Error('Club not found (Conosco not connected)')
  }

  async getClubsByClassification(
    _classification: string,
    _params?: ClubQueryParams,
  ): Promise<ConoscoApiResponse<PublicClub[]>> {
    return emptyListResponse<PublicClub>([])
  }

  async getClubStats(): Promise<ConoscoApiResponse<ClubStats>> {
    return emptyResponse<ClubStats>({
      total: 0,
      active: 0,
      inactive: 0,
      totalMembers: 0,
      byClassification: {},
      byDepartment: {},
    })
  }
}
