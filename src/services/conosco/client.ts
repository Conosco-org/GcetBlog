/**
 * Conosco HTTP Client — Real API Provider
 *
 * Implements ExternalDataProvider by calling the real Conosco Public Projection API.
 * Uses native fetch() with per-endpoint timeouts and structured error handling.
 *
 * Doctrine Rule 1: Consumes projections only — never writes back.
 * Doctrine Rule 5: Institution scoping mandatory on every call.
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
  TimeoutConfig,
} from './types'
import { DEFAULT_TIMEOUTS } from './types'

// ---------------------------------------------------------------------------
// Client Configuration
// ---------------------------------------------------------------------------

interface ConoscoClientConfig {
  baseUrl: string
  apiKey: string
  institutionCode: string
  timeouts?: Partial<TimeoutConfig>
}

// ---------------------------------------------------------------------------
// Conosco HTTP Provider
// ---------------------------------------------------------------------------

export class ConoscoProvider implements ExternalDataProvider {
  readonly name = 'conosco'

  private baseUrl: string
  private apiKey: string
  private institutionCode: string
  private timeouts: TimeoutConfig

  constructor(config: ConoscoClientConfig) {
    // Strip trailing slash
    this.baseUrl = config.baseUrl.replace(/\/+$/, '')
    this.apiKey = config.apiKey
    this.institutionCode = config.institutionCode
    this.timeouts = { ...DEFAULT_TIMEOUTS, ...config.timeouts }
  }

  // -------------------------------------------------------------------------
  // Internal fetch helper
  // -------------------------------------------------------------------------

  private async request<T>(
    path: string,
    timeoutMs: number,
    params?: Record<string, string | number | undefined>,
  ): Promise<ConoscoApiResponse<T>> {
    const url = new URL(`${this.baseUrl}/${this.institutionCode}${path}`)

    // Append query parameters
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          url.searchParams.set(key, String(value))
        }
      })
    }

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'x-api-key': this.apiKey,
          Accept: 'application/json',
        },
        signal: controller.signal,
        // Next.js: don't auto-cache at the fetch level — we use unstable_cache
        cache: 'no-store',
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error')
        throw new Error(`Conosco API ${response.status}: ${errorText}`)
      }

      // Log projection version for contract tracking (Doctrine Rule 4)
      const projectionVersion = response.headers.get('X-Projection-Version')
      if (projectionVersion) {
        // Store for health check / dashboard
        ConoscoProvider._lastProjectionVersion = projectionVersion
      }

      const json = (await response.json()) as ConoscoApiResponse<T>

      if (!json.success) {
        throw new Error(`Conosco API returned success=false for ${path}`)
      }

      return json
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error(`Conosco API timeout after ${timeoutMs}ms for ${path}`)
      }
      throw error
    } finally {
      clearTimeout(timer)
    }
  }

  // Track projection version across calls
  private static _lastProjectionVersion: string | undefined

  // -------------------------------------------------------------------------
  // Health Check
  // -------------------------------------------------------------------------

  async healthCheck(): Promise<ProviderHealth> {
    const start = Date.now()
    try {
      // Use a lightweight endpoint — event stats
      await this.request<EventStats>('/events/stats', this.timeouts.enrichment)
      return {
        healthy: true,
        provider: this.name,
        responseTimeMs: Date.now() - start,
        projectionVersion: ConoscoProvider._lastProjectionVersion,
      }
    } catch (error) {
      return {
        healthy: false,
        provider: this.name,
        responseTimeMs: Date.now() - start,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  // -------------------------------------------------------------------------
  // Events
  // -------------------------------------------------------------------------

  async getEvents(params?: EventQueryParams): Promise<ConoscoApiResponse<PublicEvent[]>> {
    return this.request<PublicEvent[]>('/events', this.timeouts.list, {
      page: params?.page,
      limit: params?.limit,
      department: params?.department,
      eventType: params?.eventType,
      status: params?.status,
      search: params?.search,
      startAfter: params?.startAfter,
      startBefore: params?.startBefore,
      sort: params?.sort,
    })
  }

  async getUpcomingEvents(params?: EventQueryParams): Promise<ConoscoApiResponse<PublicEvent[]>> {
    return this.request<PublicEvent[]>('/events/upcoming', this.timeouts.list, {
      page: params?.page,
      limit: params?.limit,
      department: params?.department,
      eventType: params?.eventType,
    })
  }

  async getRecentEvents(params?: EventQueryParams): Promise<ConoscoApiResponse<PublicEvent[]>> {
    return this.request<PublicEvent[]>('/events/recent', this.timeouts.list, {
      page: params?.page,
      limit: params?.limit,
      department: params?.department,
    })
  }

  async getEvent(eventCode: string): Promise<ConoscoApiResponse<PublicEvent>> {
    return this.request<PublicEvent>(`/events/${encodeURIComponent(eventCode)}`, this.timeouts.detail)
  }

  async getEventStats(): Promise<ConoscoApiResponse<EventStats>> {
    return this.request<EventStats>('/events/stats', this.timeouts.stats)
  }

  // -------------------------------------------------------------------------
  // Clubs
  // -------------------------------------------------------------------------

  async getClubs(params?: ClubQueryParams): Promise<ConoscoApiResponse<PublicClub[]>> {
    return this.request<PublicClub[]>('/clubs', this.timeouts.list, {
      page: params?.page,
      limit: params?.limit,
      department: params?.department,
      classification: params?.classification,
      status: params?.status,
      search: params?.search,
      sort: params?.sort,
    })
  }

  async getClub(clubCode: string): Promise<ConoscoApiResponse<PublicClub>> {
    return this.request<PublicClub>(`/clubs/${encodeURIComponent(clubCode)}`, this.timeouts.detail)
  }

  async getClubsByClassification(
    classification: string,
    params?: ClubQueryParams,
  ): Promise<ConoscoApiResponse<PublicClub[]>> {
    return this.request<PublicClub[]>(
      `/clubs/classification/${encodeURIComponent(classification)}`,
      this.timeouts.list,
      {
        page: params?.page,
        limit: params?.limit,
      },
    )
  }

  async getClubStats(): Promise<ConoscoApiResponse<ClubStats>> {
    return this.request<ClubStats>('/clubs/stats', this.timeouts.stats)
  }
}
