/**
 * Conosco Public Projection API — TypeScript Types
 *
 * These types are direct translations of the Conosco Public Projection API
 * response shapes. They represent the READ-ONLY contract between Content Engine
 * and Conosco.
 *
 * Doctrine Rule 1: Schemas never leave Conosco — we consume projections only.
 * Doctrine Rule 2: Semantic IDs publicly (eventCode, clubCode), never ObjectIds.
 * Doctrine Rule 7: Budget/financial data never leaks — these types don't include it.
 */

// ---------------------------------------------------------------------------
// API Response Wrapper
// ---------------------------------------------------------------------------

export interface ConoscoApiResponse<T> {
  success: boolean
  institution: string
  contractVersion: string
  data: T
  pagination?: ConoscoPagination
}

export interface ConoscoPagination {
  page: number
  limit: number
  total: number
  pages: number
  hasMore: boolean
}

// ---------------------------------------------------------------------------
// Public Event Projection
// ---------------------------------------------------------------------------

export interface PublicEvent {
  eventCode: string
  title: string
  description: string
  eventType: 'workshop' | 'seminar' | 'hackathon' | 'competition' | 'cultural' | 'sports' | 'guest-lecture' | 'conference' | 'webinar' | 'other'
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'

  /** ISO date strings */
  startDate: string
  endDate: string
  registrationDeadline?: string

  venue: PublicVenue
  organizer: PublicOrganizer

  /** Registration info */
  registration: {
    isOpen: boolean
    maxParticipants?: number
    registeredCount: number
    registrationUrl?: string
  }

  /** Tags for filtering */
  tags: string[]
  /** Department code (e.g. 'CSE', 'ECE') */
  department?: string

  /** Poster/banner URL from Conosco */
  posterUrl?: string

  /** Completion data (only for completed events) */
  completion?: {
    attendeeCount: number
    feedbackRating?: number
    certificateAvailable: boolean
    certificateVerificationUrl?: string
  }

  /** NAAC criteria this event maps to */
  naacCriteria?: string[]

  /** Recent achievements associated with this event */
  recentAchievements?: PublicAchievement[]

  /** Timestamps */
  createdAt: string
  updatedAt: string
}

export interface PublicVenue {
  name: string
  type: 'physical' | 'virtual' | 'hybrid'
  address?: string
  capacity?: number
  meetingLink?: string
}

export interface PublicOrganizer {
  name: string
  type: 'club' | 'department' | 'institution' | 'external'
  clubCode?: string
  departmentCode?: string
}

export interface PublicAchievement {
  title: string
  description?: string
  date: string
  category: string
}

// ---------------------------------------------------------------------------
// Public Club Projection
// ---------------------------------------------------------------------------

export interface PublicClub {
  clubCode: string
  name: string
  description: string
  classification: 'technical' | 'cultural' | 'sports' | 'social' | 'professional' | 'other'
  status: 'active' | 'inactive'

  /** Department affiliation */
  department?: string

  /** Leadership & contacts */
  coordinator?: PublicCoordinator
  facultyAdvisor?: PublicFacultyAdvisor

  /** Stats */
  memberCount: number

  /** Social & web presence */
  socialLinks?: {
    website?: string
    instagram?: string
    linkedin?: string
    twitter?: string
    github?: string
  }

  /** Logo/avatar URL from Conosco */
  logoUrl?: string

  /** Recent events organized by this club */
  recentEvents?: PublicClubEvent[]

  /** Recent achievements */
  recentAchievements?: PublicAchievement[]

  /** Timestamps */
  createdAt: string
  updatedAt: string
}

export interface PublicCoordinator {
  name: string
  email?: string
  phone?: string
}

export interface PublicFacultyAdvisor {
  name: string
  designation?: string
  department?: string
}

export interface PublicClubEvent {
  eventCode: string
  title: string
  startDate: string
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
}

// ---------------------------------------------------------------------------
// Stats Projections
// ---------------------------------------------------------------------------

export interface EventStats {
  total: number
  upcoming: number
  ongoing: number
  completed: number
  cancelled: number
  totalParticipants: number
  averageFeedbackRating?: number
  byType: Record<string, number>
  byDepartment: Record<string, number>
}

export interface ClubStats {
  total: number
  active: number
  inactive: number
  totalMembers: number
  byClassification: Record<string, number>
  byDepartment: Record<string, number>
}

// ---------------------------------------------------------------------------
// Query Parameters
// ---------------------------------------------------------------------------

export interface EventQueryParams {
  page?: number
  limit?: number
  department?: string
  eventType?: string
  status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  search?: string
  startAfter?: string
  startBefore?: string
  sort?: string
}

export interface ClubQueryParams {
  page?: number
  limit?: number
  department?: string
  classification?: string
  status?: 'active' | 'inactive'
  search?: string
  sort?: string
}

// ---------------------------------------------------------------------------
// Provider Interface (Strategy Pattern — Doctrine Rule: ExternalEventProvider)
// ---------------------------------------------------------------------------

/**
 * Provider-agnostic interface for external event/club data.
 * Implementations: ConoscoProvider (real API), DisconnectedProvider (fallback).
 *
 * Future: GoogleSheetsProvider, VToolsProvider, CSVProvider, etc.
 */
export interface ExternalDataProvider {
  /** Human-readable provider name */
  readonly name: string

  /** Check if the provider is available and healthy */
  healthCheck(): Promise<ProviderHealth>

  // -- Events --
  getEvents(params?: EventQueryParams): Promise<ConoscoApiResponse<PublicEvent[]>>
  getUpcomingEvents(params?: EventQueryParams): Promise<ConoscoApiResponse<PublicEvent[]>>
  getRecentEvents(params?: EventQueryParams): Promise<ConoscoApiResponse<PublicEvent[]>>
  getEvent(eventCode: string): Promise<ConoscoApiResponse<PublicEvent>>
  getEventStats(): Promise<ConoscoApiResponse<EventStats>>

  // -- Clubs --
  getClubs(params?: ClubQueryParams): Promise<ConoscoApiResponse<PublicClub[]>>
  getClub(clubCode: string): Promise<ConoscoApiResponse<PublicClub>>
  getClubsByClassification(classification: string, params?: ClubQueryParams): Promise<ConoscoApiResponse<PublicClub[]>>
  getClubStats(): Promise<ConoscoApiResponse<ClubStats>>
}

// ---------------------------------------------------------------------------
// Provider Health
// ---------------------------------------------------------------------------

export interface ProviderHealth {
  healthy: boolean
  provider: string
  responseTimeMs: number
  projectionVersion?: string
  error?: string
}

// ---------------------------------------------------------------------------
// Timeout Configuration
// ---------------------------------------------------------------------------

export interface TimeoutConfig {
  /** Timeout for enrichment calls (inline async, must be fast) — default 3000ms */
  enrichment: number
  /** Timeout for detail page calls — default 5000ms */
  detail: number
  /** Timeout for list page calls — default 8000ms */
  list: number
  /** Timeout for stats/dashboard calls — default 10000ms */
  stats: number
}

export const DEFAULT_TIMEOUTS: TimeoutConfig = {
  enrichment: 3000,
  detail: 5000,
  list: 8000,
  stats: 10000,
}

// ---------------------------------------------------------------------------
// Cache TTL Configuration
// ---------------------------------------------------------------------------

export interface CacheTTLConfig {
  /** Events cache TTL in seconds — default 300 (5min) */
  events: number
  /** Clubs cache TTL in seconds — default 600 (10min) */
  clubs: number
  /** Stats cache TTL in seconds — default 900 (15min) */
  stats: number
}

export const DEFAULT_CACHE_TTLS: CacheTTLConfig = {
  events: 300,
  clubs: 600,
  stats: 900,
}
