/**
 * Department Module Types
 *
 * Types for merged department display data (CMS only — departments are
 * managed entirely within the Content Engine, not synced from Conosco).
 */

// ---------------------------------------------------------------------------
// Merged Department Display Data
// ---------------------------------------------------------------------------

export interface DepartmentDisplayData {
  slug: string
  title: string
  code: string
  editorialDescription?: Record<string, unknown> | null
  shortDescription?: string

  /** Academic category */
  category?: 'engineering' | 'science' | 'arts' | 'commerce' | 'management' | 'other'

  /** HOD / contact */
  hod?: { name: string; email?: string; designation?: string }

  /** Stats */
  facultyCount?: number
  studentCount?: number
  yearEstablished?: number

  /** Social & web presence */
  socialLinks?: {
    website?: string
    instagram?: string
    linkedin?: string
  }

  /** Media */
  heroImageUrl?: string
  logoUrl?: string

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
  }

  /** CMS record ID */
  cmsId?: string

  /** Related blog posts */
  relatedPostSlugs?: string[]

  /** Related clubs */
  relatedClubSlugs?: string[]
}

/**
 * Lightweight department for list/card views
 */
export interface DepartmentCardData {
  slug: string
  title: string
  code: string
  shortDescription?: string
  category?: string
  heroImageUrl?: string
  logoUrl?: string
  featured: boolean
  facultyCount?: number
  studentCount?: number
}
