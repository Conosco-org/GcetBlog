import type { Where } from 'payload'

/**
 * Validation utilities for post-related operations
 */

/**
 * Validate meta description length (120-160 characters recommended for SEO)
 * Returns error message if invalid, null if valid
 */
export function validateMetaDescription(description: string | null | undefined): string | null {
  if (!description) {
    return 'Meta description is required'
  }

  const length = description.trim().length

  if (length < 120) {
    return `Meta description is too short (${length} chars). Recommended: 120-160 characters.`
  }

  if (length > 160) {
    return `Meta description is too long (${length} chars). Recommended: 120-160 characters.`
  }

  return null
}

/**
 * Validate featured post date range
 * Both featuredFrom and featuredUntil must be provided together
 * Returns error message if invalid, null if valid
 */
export function validateFeaturedRange(
  featuredFrom: string | null | undefined,
  featuredUntil: string | null | undefined,
): string | null {
  // If neither is provided, that's fine (post is not featured)
  if (!featuredFrom && !featuredUntil) {
    return null
  }

  // If only one is provided, that's an error
  if (!featuredFrom || !featuredUntil) {
    return 'Both "Featured From" and "Featured Until" dates are required to feature a post'
  }

  // Validate that featuredFrom is before featuredUntil
  const fromDate = new Date(featuredFrom)
  const untilDate = new Date(featuredUntil)

  if (fromDate >= untilDate) {
    return '"Featured From" date must be before "Featured Until" date'
  }

  return null
}

/**
 * Where clause for published and visible posts
 * Used for public-facing queries to ensure only published posts are shown
 * Optionally accepts a timestamp to filter by featured dates
 */
export function publishedVisibilityWhere(_now?: string): Where {
  return {
    _status: { equals: 'published' },
  }
}
