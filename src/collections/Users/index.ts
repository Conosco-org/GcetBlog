import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { adminOnly } from '../../access/adminOnly'
import { adminOrSelf } from '../../access/adminOrSelf'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: ({ req: { user } }) => {
      if (!user || typeof user !== 'object') return false
      return Boolean((user as unknown as Record<string, unknown>).isAdmin === true)
    },
    create: authenticated,
    delete: adminOnly,
    // Public can read basic profile info, authenticated users see more
    read: () => true,
    update: adminOrSelf,
  },
  admin: {
    defaultColumns: ['name', 'email', 'role'],
    useAsTitle: 'name',
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
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Contributor', value: 'contributor' },
        { label: 'Editor', value: 'editor' },
        { label: 'Admin', value: 'admin' },
      ],
      defaultValue: 'contributor',
      access: {
        update: ({ req }) => {
          const user = req.user as { role?: string } | undefined
          return user?.role === 'admin'
        },
      },
    },
    {
      name: 'isAdmin',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Grant admin privileges for user management, logs, and system oversight',
        position: 'sidebar',
      },
      access: {
        update: ({ req }) => {
          const user = req.user as { role?: string; isAdmin?: boolean } | undefined
          return user?.isAdmin === true
        },
      },
    },
    {
      name: 'canManageAdmins',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Can grant/revoke admin privileges. Protected from deletion.',
        position: 'sidebar',
      },
      access: {
        update: ({ req }) => {
          const user = req.user as { canManageAdmins?: boolean } | undefined
          return user?.canManageAdmins === true
        },
      },
    },
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
  ],
  timestamps: true,
}
