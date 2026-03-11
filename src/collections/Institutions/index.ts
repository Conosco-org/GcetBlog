import type { CollectionConfig } from 'payload'

import { isSuperAdmin } from '../../access/isSuperAdmin'
import { isInstitutionAdmin, getUserInstitutionId } from '../../access/hasPermission'

export const Institutions: CollectionConfig = {
  slug: 'institutions',
  labels: {
    singular: 'Institution',
    plural: 'Institutions',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'code', 'status', 'tier', 'createdAt'],
    group: 'Platform',
    description: 'Manage institutions (colleges) on the platform',
  },
  access: {
    // Public can read basic institution info (name, logo, code)
    read: () => true,
    // Only superadmin can create new institutions
    create: isSuperAdmin,
    // Superadmin can update any. institution_admin can update their own.
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'superadmin') return true
      // institution_admin can update their own institution
      const instId = getUserInstitutionId(user)
      if (instId && isInstitutionAdmin(user, instId)) {
        return { id: { equals: instId } }
      }
      return false
    },
    // Only superadmin can delete institutions
    delete: isSuperAdmin,
  },
  fields: [
    // ── Identity ────────────────────────────────────────────────────────
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Full institution name (e.g., "G H Patel College of Engineering and Technology")',
      },
    },
    {
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Short code used in URLs, API routing, and data isolation (e.g., "gcet")',
      },
      validate: (value: string | null | undefined) => {
        if (!value) return 'Code is required'
        if (!/^[a-z0-9-]+$/.test(value)) {
          return 'Code must be lowercase alphanumeric with hyphens only'
        }
        if (value.length < 2 || value.length > 30) {
          return 'Code must be 2-30 characters'
        }
        return true
      },
    },
    {
      name: 'shortName',
      type: 'text',
      admin: {
        description: 'Short display name (e.g., "GCET")',
      },
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Institution logo',
      },
    },

    // ── Multi-Domain Mapping ────────────────────────────────────────────
    // Each institution can have multiple domains (main site, club subdomains, etc.)
    // The tenant resolver uses this array to map hostname → institution.
    {
      name: 'domains',
      type: 'array',
      admin: {
        description: 'Custom domains mapped to this institution. College IT adds CNAME → your platform.',
        initCollapsed: false,
      },
      fields: [
        {
          name: 'hostname',
          type: 'text',
          required: true,
          index: true,
          admin: {
            description: 'Full hostname (e.g., "blog.gcet.edu.in", "ieee.gcet.edu.in")',
          },
          validate: (value: string | null | undefined) => {
            if (!value) return 'Hostname is required'
            // Basic hostname validation (no protocol, no path)
            if (value.includes('://') || value.includes('/')) {
              return 'Enter hostname only — no protocol or path (e.g., blog.gcet.edu.in)'
            }
            return true
          },
        },
        {
          name: 'purpose',
          type: 'select',
          required: true,
          defaultValue: 'main',
          options: [
            { label: 'Main Site', value: 'main' },
            { label: 'Blog Only', value: 'blog' },
            { label: 'Club Site', value: 'club' },
            { label: 'Department Site', value: 'department' },
          ],
          admin: {
            description: 'What this domain is for — determines content filtering and routing behavior',
          },
        },
        {
          name: 'scopeId',
          type: 'text',
          admin: {
            description: 'Club slug or department code (only for club/department domains)',
            condition: (_data, siblingData) =>
              siblingData?.purpose === 'club' || siblingData?.purpose === 'department',
          },
        },
        {
          name: 'verified',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Has DNS/CNAME been verified? (auto-set by verification check)',
          },
        },
      ],
    },

    // ── Status & Tier ───────────────────────────────────────────────────
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'trial',
      index: true,
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Trial', value: 'trial' },
        { label: 'Suspended', value: 'suspended' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Institution lifecycle status',
      },
    },
    {
      name: 'tier',
      type: 'select',
      required: true,
      defaultValue: 'pilot',
      options: [
        { label: 'Pilot (Subdomain only)', value: 'pilot' },
        { label: 'Standard (Custom domain + CMS)', value: 'standard' },
        { label: 'Premium (Custom domain + Conosco ERP)', value: 'premium' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Subscription tier — determines available features',
      },
    },

    // ── Contact & metadata ──────────────────────────────────────────────
    {
      name: 'contact',
      type: 'group',
      admin: { description: 'Institution contact information' },
      fields: [
        {
          name: 'email',
          type: 'email',
          admin: { description: 'Primary contact email' },
        },
        {
          name: 'phone',
          type: 'text',
          admin: { description: 'Contact phone number' },
        },
        {
          name: 'website',
          type: 'text',
          admin: { description: 'Official institution website' },
        },
        {
          name: 'address',
          type: 'textarea',
          admin: { description: 'Physical address' },
        },
      ],
    },

    // ── Settings ────────────────────────────────────────────────────────
    {
      name: 'settings',
      type: 'group',
      admin: { description: 'Institution-level settings' },
      fields: [
        {
          name: 'enabledModules',
          type: 'select',
          hasMany: true,
          options: [
            { label: 'Blog', value: 'blog' },
            { label: 'Events', value: 'events' },
            { label: 'Clubs', value: 'clubs' },
            { label: 'Gallery', value: 'gallery' },
            { label: 'Newsletter', value: 'newsletter' },
            { label: 'Conosco Integration', value: 'conosco' },
          ],
          defaultValue: ['blog', 'events', 'clubs'],
          admin: {
            description: 'Which platform modules are enabled for this institution',
          },
        },
        {
          name: 'maxUsers',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Maximum users allowed (0 = unlimited)',
          },
        },
        {
          name: 'conoscoInstitutionCode',
          type: 'text',
          admin: {
            description: 'Conosco ERP institution code for API integration',
          },
        },
        {
          name: 'conoscoApiUrl',
          type: 'text',
          admin: {
            description: 'Per-institution Conosco API endpoint (e.g., https://api.conosco.in/v1)',
          },
        },
      ],
    },

    // ── Branding / Theme ────────────────────────────────────────────────
    // Per-institution visual identity. Injected as CSS custom properties.
    {
      name: 'branding',
      type: 'group',
      admin: {
        description: 'Visual branding applied across this institution\'s site',
      },
      fields: [
        {
          name: 'primaryColor',
          type: 'text',
          defaultValue: '#1a5276',
          admin: { description: 'Primary brand color (hex, e.g., #1a5276)' },
        },
        {
          name: 'accentColor',
          type: 'text',
          admin: { description: 'Accent/secondary color (hex)' },
        },
        {
          name: 'tagline',
          type: 'text',
          admin: { description: 'Institution tagline (appears in hero, footer, etc.)' },
        },
        {
          name: 'favicon',
          type: 'upload',
          relationTo: 'media',
          admin: { description: 'Custom favicon for this institution\'s site' },
        },
      ],
    },

    // ── Site Content (per-institution Header/Footer) ────────────────────
    // Globals in Payload are singletons. For multi-tenant, each institution
    // stores its own nav items and footer content here.
    {
      name: 'headerNavItems',
      type: 'array',
      admin: {
        description: 'Navigation items for this institution\'s header. Falls back to global Header if empty.',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'url',
          type: 'text',
          required: true,
          admin: { description: 'Relative URL (e.g., /events) or absolute URL' },
        },
        {
          name: 'newTab',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
    },
    {
      name: 'footerNavItems',
      type: 'array',
      admin: {
        description: 'Footer links for this institution. Falls back to global Footer if empty.',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'url',
          type: 'text',
          required: true,
        },
        {
          name: 'newTab',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
    },
    {
      name: 'footerText',
      type: 'textarea',
      admin: {
        description: 'Custom footer text (copyright, disclaimer, etc.)',
      },
    },
  ],
  timestamps: true,
}
