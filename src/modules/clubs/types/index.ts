/**
 * Club Module Types
 *
 * Types for merged club display data (CMS + API).
 */

import type { DataSource } from '@/core/types'

// ---------------------------------------------------------------------------
// Merged Club Display Data
// ---------------------------------------------------------------------------

export interface ClubDisplayData {
  slug: string
  title: string
  editorialDescription?: Record<string, unknown> | null
  conoscoDescription?: string
  dataSource: DataSource
  conoscoClubCode?: string

  classification?: string
  department?: string
  tags?: string[]

  /** Status: Conosco truth, manual fallback */
  status: 'active' | 'inactive'

  /** Leadership (Conosco only) */
  coordinator?: { name: string; email?: string; phone?: string }
  facultyAdvisor?: { name: string; designation?: string; department?: string }

  /** Stats (Conosco only) */
  memberCount?: number

  /** Social links */
  socialLinks?: {
    website?: string
    instagram?: string
    linkedin?: string
    twitter?: string
    github?: string
  }

  /** Media — CMS hero/logo take priority */
  heroImageUrl?: string
  logoUrl?: string
  conoscoLogoUrl?: string

  /** CMS metadata */
  featured: boolean
  publishedAt?: string

  /** SEO metadata */
  meta?: {
    title?: string
    description?: string
    image?: { url?: string }
  }

  /** Theme customization */
  theme?: {
    primaryColor?: string
    accentColor?: string
    cardStyle?: string
    fontPreset?: string
  }

  /** CMS record ID */
  cmsId?: string

  /** Related blog posts */
  relatedPostSlugs?: string[]

  /** Recent events (Conosco only) */
  recentEvents?: Array<{
    eventCode: string
    title: string
    startDate: string
    status: string
  }>

  /** Recent achievements (Conosco only) */
  recentAchievements?: Array<{
    title: string
    description?: string
    date: string
    category: string
  }>
}

/**
 * Lightweight club for list/card views
 */
export interface ClubCardData {
  slug: string
  title: string
  classification?: string
  department?: string
  status: string
  logoUrl?: string
  heroImageUrl?: string
  featured: boolean
  dataSource: DataSource
  memberCount?: number
}

// Re-export Conosco types that modules need
export type { PublicClub, ClubStats, ClubQueryParams } from '@/services/conosco/types'
