/**
 * Reusable Institution Field — Content Engine v2 (Multi-tenant)
 *
 * Add this field to any collection that needs institution-scoping.
 * Auto-populates from the creating user's institution.
 *
 * Usage:
 *   import { institutionField } from '@/fields/institution'
 *   fields: [ institutionField, ...otherFields ]
 */

import type { Field } from 'payload'

/**
 * Standard institution relationship field.
 * - Required on all institution-scoped content
 * - Auto-set from the creating user's institution
 * - Read-only in admin (only superadmin can change via API)
 * - Indexed for fast filtering
 */
export const institutionField: Field = {
  name: 'institution',
  type: 'relationship',
  relationTo: 'institutions',
  required: true,
  index: true,
  admin: {
    position: 'sidebar',
    description: 'Auto-set from your institution',
    // Hide from non-superadmin users — they can't change it anyway
    condition: (data, siblingData, { user }) => {
      return user?.role === 'superadmin'
    },
  },
  hooks: {
    beforeChange: [
      ({ req, value, operation }) => {
        // Auto-set from user's institution on create
        if (operation === 'create' && !value && req.user) {
          const user = req.user as { institution?: string | { id: string } }
          if (user.institution) {
            return typeof user.institution === 'object'
              ? user.institution.id
              : user.institution
          }
        }
        // Prevent non-superadmin from changing institution after creation
        if (operation === 'update' && req.user) {
          const u = req.user as { role?: string }
          if (u.role !== 'superadmin') {
            return undefined // keep existing value
          }
        }
        return value
      },
    ],
  },
}

/**
 * Optional institution field — for collections where institution is not always required
 * (e.g., Media uploaded by superadmin without institution context).
 */
export const optionalInstitutionField: Field = {
  ...institutionField,
  required: false,
}
