/**
 * Theme Configuration — Institution-Specific Branding
 *
 * This is the ONLY file that needs changing when deploying the
 * Content Engine for a different institution (e.g. IEEE GCET → GCET Blog).
 *
 * Swap this file + environment variables to rebrand the entire platform.
 */

export interface ThemeConfig {
  /** Institution code for Conosco API scoping (Doctrine Rule 5) */
  institutionCode: string

  /** Display name shown in headers, footers, emails */
  institutionName: string

  /** Short abbreviation */
  abbreviation: string

  /** Primary branding */
  branding: {
    siteName: string
    tagline: string
    logoPath: string
    faviconPath: string
    /** Primary brand color (hex) */
    primaryColor: string
    /** Secondary/accent color (hex) */
    accentColor: string
  }

  /** Social links */
  social: {
    website?: string
    instagram?: string
    linkedin?: string
    twitter?: string
    youtube?: string
    github?: string
  }

  /** Contact information */
  contact: {
    email: string
    phone?: string
    address?: string
  }

  /** Feature flags — enable/disable modules per deployment */
  features: {
    /** Show events module (requires Conosco or manual events) */
    events: boolean
    /** Show clubs module (requires Conosco or manual clubs) */
    clubs: boolean
    /** Show newsletter module */
    newsletter: boolean
    /** Show landing page builder */
    landingPages: boolean
    /** Enable Conosco API integration */
    conoscoIntegration: boolean
  }

  /** Platform version (shown in sidebar footer) */
  version: string
}

// ---------------------------------------------------------------------------
// GCET Blog Configuration (Default)
// ---------------------------------------------------------------------------

export const themeConfig: ThemeConfig = {
  institutionCode: 'GCET',
  institutionName: 'G H Patel College of Engineering & Technology',
  abbreviation: 'GCET',

  branding: {
    siteName: 'GCET Blog',
    tagline: 'Stories, Events & Innovation from GCET',
    logoPath: '/gcet-logo.png',
    faviconPath: '/gcet-logo.png',
    primaryColor: '#1e3a5f',
    accentColor: '#f59e0b',
  },

  social: {
    website: 'https://gcet.ac.in',
    instagram: 'https://instagram.com/gcet.official',
    linkedin: 'https://linkedin.com/school/gcet',
  },

  contact: {
    email: 'blog@gcet.edu.in',
    address: 'Vallabh Vidyanagar, Gujarat, India',
  },

  features: {
    events: true,
    clubs: true,
    newsletter: true,
    landingPages: true,
    conoscoIntegration: true,
  },

  version: '2.0.0',
}
