import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { isSuperAdmin, isSuperAdminField } from '../../access/isSuperAdmin'
import { selfOrAdmin } from '../../access/selfOrAdmin'
import { ASSIGNABLE_ROLES, ROLE_LABELS } from '../../access/permissions'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    // Payload admin panel: superadmin, institution_admin, and users with role assignments
    admin: ({ req: { user } }) => {
      if (!user || typeof user !== 'object') return false
      const u = user as unknown as {
        role?: string
        roleAssignments?: Array<{ assignedRole?: string }>
      }
      // SuperAdmin always has access
      if (u.role === 'superadmin') return true
      // Users with any role assignment can access admin panel
      // (their per-collection access controls what they can actually do)
      return (u.roleAssignments || []).length > 0
    },
    create: authenticated,
    delete: isSuperAdmin,
    // selfOrAdmin: superadmin sees all, institution_admin sees their institution, users see self
    read: selfOrAdmin,
    update: selfOrAdmin,
  },
  admin: {
    defaultColumns: ['name', 'email', 'role', 'institution'],
    useAsTitle: 'name',
    group: 'Platform',
  },
  auth: true,
  hooks: {
    beforeChange: [
      // When a Google-only user sets a password via the profile page,
      // upgrade their authProvider to 'both' so email login works too.
      ({ data, originalDoc }) => {
        if (data?.password && originalDoc?.authProvider === 'google') {
          data.authProvider = 'both'
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    // -----------------------------------------------------------------------
    // Multi-tenant: Institution this user belongs to
    // SuperAdmin has NO institution — they're platform-level
    // -----------------------------------------------------------------------
    {
      name: 'institution',
      type: 'relationship',
      relationTo: 'institutions',
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Which institution this user belongs to. SuperAdmins have no institution.',
        // Only superadmin can change institution assignment
        condition: (data, siblingData, { user }) => {
          return user?.role === 'superadmin'
        },
      },
      access: {
        update: isSuperAdminField,
      },
    },
    // -----------------------------------------------------------------------
    // Base Role: superadmin (platform owner) or user (everyone else)
    // -----------------------------------------------------------------------
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'User', value: 'user' },
        { label: 'SuperAdmin', value: 'superadmin' },
      ],
      defaultValue: 'user',
      access: {
        // Only superadmin can change base roles
        update: isSuperAdminField,
      },
      admin: {
        description: 'Base role. SuperAdmin = platform owner. User = institution member with role assignments.',
        position: 'sidebar',
      },
    },
    // -----------------------------------------------------------------------
    // Role Assignments — where the real power comes from
    // -----------------------------------------------------------------------
    {
      name: 'roleAssignments',
      type: 'array',
      admin: {
        description:
          'Assigned roles with scope. institution_admin can assign roles within their institution. SuperAdmin can assign any role.',
      },
      access: {
        // Only superadmin and institution_admin can modify
        update: ({ req }) => {
          const user = req.user as {
            role?: string
            roleAssignments?: Array<{ assignedRole?: string }>
          } | undefined
          if (!user) return false
          if (user.role === 'superadmin') return true
          // institution_admin can assign roles
          return (user.roleAssignments || []).some(
            (a) => a.assignedRole === 'institution_admin',
          )
        },
      },
      fields: [
        {
          name: 'assignedRole',
          type: 'select',
          required: true,
          options: ASSIGNABLE_ROLES.map((r) => ({
            label: ROLE_LABELS[r],
            value: r,
          })),
        },
        {
          name: 'scopeType',
          type: 'select',
          required: true,
          options: [
            { label: 'Institution', value: 'institution' },
            { label: 'Club', value: 'club' },
            { label: 'Blog', value: 'blog' },
            { label: 'Global (within institution)', value: 'global' },
          ],
        },
        {
          name: 'scopeId',
          type: 'relationship',
          relationTo: ['clubs', 'institutions'],
          admin: {
            description:
              'Which club or institution this role applies to. Required for club and institution scopes.',
            condition: (data, siblingData) =>
              siblingData?.scopeType === 'club' || siblingData?.scopeType === 'institution',
          },
        },
        {
          name: 'scopeLabel',
          type: 'text',
          admin: {
            readOnly: true,
            description: 'Auto-populated display label (e.g., "Coding Club", "GCET")',
          },
        },
      ],
    },
    // -----------------------------------------------------------------------
    // Profile fields
    // -----------------------------------------------------------------------
    {
      name: 'bio',
      type: 'textarea',
      admin: {
        description: 'Short bio for author pages',
      },
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'department',
      type: 'text',
      admin: {
        description: 'Department or branch (e.g., CSE, ECE, ME)',
      },
    },
    {
      name: 'year',
      type: 'text',
      admin: {
        description: 'Year of study or designation',
      },
    },
    // -----------------------------------------------------------------------
    // Auth provider tracking
    // -----------------------------------------------------------------------
    {
      name: 'authProvider',
      type: 'select',
      options: [
        { label: 'Local (Email/Password)', value: 'local' },
        { label: 'Google', value: 'google' },
        { label: 'Both', value: 'both' },
      ],
      defaultValue: 'local',
      admin: {
        description: 'How the user authenticates (managed automatically)',
        position: 'sidebar',
        readOnly: true,
      },
      access: {
        // Only server-side code (overrideAccess) can change this
        update: () => false,
      },
    },
    {
      name: 'googleSubId',
      type: 'text',
      unique: true,
      admin: {
        description: 'Google account unique ID (set automatically on Google sign-in)',
        position: 'sidebar',
        readOnly: true,
      },
      access: {
        update: () => false,
      },
    },
    // -----------------------------------------------------------------------
    // Social & newsletter
    // -----------------------------------------------------------------------
    {
      name: 'socialLinks',
      type: 'group',
      admin: {
        description: 'Social media profiles',
      },
      fields: [
        {
          name: 'twitter',
          type: 'text',
          admin: { description: 'Twitter/X profile URL' },
        },
        {
          name: 'linkedin',
          type: 'text',
          admin: { description: 'LinkedIn profile URL' },
        },
        {
          name: 'github',
          type: 'text',
          admin: { description: 'GitHub profile URL' },
        },
        {
          name: 'website',
          type: 'text',
          admin: { description: 'Personal website URL' },
        },
      ],
    },
    {
      name: 'newsletterOptIn',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Opt-in to receive the newsletter',
        position: 'sidebar',
      },
    },
    {
      name: 'newsletterFrequency',
      type: 'select',
      options: [
        { label: 'Daily', value: 'daily' },
        { label: 'Weekly', value: 'weekly' },
        { label: 'Monthly', value: 'monthly' },
      ],
      defaultValue: 'weekly',
      admin: {
        description: 'How often you want to receive newsletters',
        position: 'sidebar',
        condition: (data) => data?.newsletterOptIn === true,
      },
    },
    {
      name: 'newsletterCategories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      admin: {
        description: 'Only receive newsletters about these categories (leave empty for all)',
        position: 'sidebar',
        condition: (data) => data?.newsletterOptIn === true,
      },
    },
  ],
  timestamps: true,
}
