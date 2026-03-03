/**
 * Event Module Types
 *
 * Types for merged event display data (CMS + API).
 * These types represent what the frontend actually renders.
 */

import type { PublicVenue, PublicOrganizer } from '@/services/conosco/types'
import type { DataSource } from '@/core/types'

// ---------------------------------------------------------------------------
// Merged Event Display Data
// ---------------------------------------------------------------------------

/**
 * Event as rendered on the frontend — merges CMS editorial data
 * with Conosco operational data per Doctrine Rule 3.
 */
export interface EventDisplayData {
  /** CMS slug (human-readable URL) */
  slug: string
  /** Event title (CMS for manual, Conosco for synced) */
  title: string
  /** Rich editorial description from CMS (Lexical editor state) */
  editorialDescription?: Record<string, unknown> | null
  /** Plain description from Conosco */
  conoscoDescription?: string
  /** Data source discriminator */
  dataSource: DataSource
  /** Conosco event code (if synced) */
  conoscoEventCode?: string

  /** Event classification */
  eventType?: string
  department?: string
  tags?: string[]

  /** Dates — operational truth from Conosco, manual fallback */
  startDate?: string
  endDate?: string
  registrationDeadline?: string

  /** Status — operational truth from Conosco, manual fallback */
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'

  /** Venue info (Conosco) */
  venue?: PublicVenue
  /** Organizer info (Conosco) */
  organizer?: PublicOrganizer

  /** Registration info (Conosco only, never CMS) */
  registration?: {
    isOpen: boolean
    maxParticipants?: number
    registeredCount: number
    registrationUrl?: string
  }

  /** Completion data (Conosco only) */
  completion?: {
    attendeeCount: number
    feedbackRating?: number
    certificateAvailable: boolean
    certificateVerificationUrl?: string
  }

  /** Media — CMS hero takes priority over Conosco poster */
  heroImageUrl?: string
  posterUrl?: string

  /** CMS metadata */
  featured: boolean
  publishedAt?: string

  /** SEO metadata (CMS) */
  meta?: {
    title?: string
    description?: string
    image?: { url?: string }
  }

  /** CMS record ID (for admin links) */
  cmsId?: string

  /** Related blog posts (CMS relationship) */
  relatedPostSlugs?: string[]
}

/**
 * Lightweight event for list/card views
 */
export interface EventCardData {
  slug: string
  title: string
  eventType?: string
  department?: string
  status: string
  startDate?: string
  endDate?: string
  heroImageUrl?: string
  posterUrl?: string
  featured: boolean
  dataSource: DataSource
  registeredCount?: number
  venue?: { name: string; type: string }
}

// Re-export Conosco types that modules need
export type { PublicEvent, EventStats, EventQueryParams } from '@/services/conosco/types'
