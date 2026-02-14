import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { isAdminAccess } from '../../access/isAdminAccess'
import { adminOrSelf } from '../../access/adminOrSelf'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    // No one accesses the Payload admin panel — all management via custom dashboards
    admin: () => false,
    create: authenticated,
    delete: ({ req: { user } }) => {
      if (!user) return false
      const typedUser = user as unknown as Record<string, unknown>
      // Only admins can delete users
      if (typedUser.isAdmin !== true) return false
      // Nobody can delete a canManageAdmins user
      return {
        canManageAdmins: { not_equals: true },
      }
    },
    read: authenticated,
    update: adminOrSelf,
  },
  admin: {
    defaultColumns: ['name', 'email', 'role', 'isAdmin'],
    useAsTitle: 'name',
  },
  auth: true,
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
      ],
      defaultValue: 'contributor',
      access: {
        update: ({ req }) => {
          // Only admins can change user roles
          const user = req.user as unknown as Record<string, unknown> | undefined
          return user?.isAdmin === true
        },
      },
    },
    {
      name: 'isAdmin',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Grants user management capabilities (manage users, process role requests, view logs)',
        condition: (data) => data?.role === 'editor',
      },
      access: {
        read: () => true, // Always readable so middleware can check it
        update: ({ req }) => {
          // Only canManageAdmins users can grant/revoke isAdmin
          const user = req.user as unknown as Record<string, unknown> | undefined
          return user?.canManageAdmins === true
        },
      },
    },
    {
      name: 'canManageAdmins',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Can manage admin users and cannot be deleted. Only other canManageAdmins users can grant this.',
        condition: (data) => data?.role === 'editor' && data?.isAdmin === true,
      },
      access: {
        read: () => true, // Always readable so middleware can check it
        update: ({ req }) => {
          // Only existing canManageAdmins users can grant this permission
          const user = req.user as unknown as Record<string, unknown> | undefined
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
  ],
  timestamps: true,
}
