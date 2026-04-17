import type { CollectionConfig } from 'payload'

import { isAuthenticated } from '@backend/access/is-authenticated'
import { isAdminAccess } from '@backend/access/is-admin-access'
import { adminOrSelf } from '@backend/access/admin-or-self'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: ({ req: { user } }) => {
      if (!user || typeof user !== 'object') return false
      return Boolean((user as unknown as Record<string, unknown>).isAdmin === true)
    },
    create: isAuthenticated,
    delete: isAdminAccess,
    read: adminOrSelf,
    update: adminOrSelf,
  },
  admin: {
    defaultColumns: ['name', 'email', 'role'],
    useAsTitle: 'name',
  },
  auth: true,
  hooks: {
    beforeLogin: [
      async ({ req, user }) => {
        // Check if the account is active
        if (user && 'isActive' in user && user.isActive === false) {
          throw new Error('Your account has been disabled. Please contact support.')
        }
        return user
      },
    ],
    afterLogin: [
      async ({ req, user }) => {
        const payload = req.payload
        // Use setTimeout to avoid write conflicts during login
        // This makes the update non-blocking and happens after the login completes
        setTimeout(async () => {
          try {
            await payload.update({
              collection: 'users',
              id: user.id,
              data: {
                lastLoginAt: new Date().toISOString(),
                lastActiveAt: new Date().toISOString(),
                loginCount: (user.loginCount || 0) + 1,
              },
              overrideAccess: true,
            })
          } catch (error) {
            // Silently fail - login tracking is not critical
            console.error('Failed to update login tracking:', error)
          }
        }, 0)
      },
    ],
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
      name: 'username',
      type: 'text',
      unique: true,
      admin: {
        description: 'Unique username for @mentions',
      },
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
        description: 'Short bio for author pages (max 500 characters)',
      },
      maxLength: 500,
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
    // Activity tracking fields
    {
      name: 'lastLoginAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'loginCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'lastActiveAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'postCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Number of published posts',
      },
    },
    {
      name: 'commentCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description: 'Deactivate instead of deleting accounts',
      },
    },
    {
      name: 'deactivatedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        condition: (data) => !data.isActive,
        readOnly: true,
      },
    },
    {
      name: 'deactivatedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        position: 'sidebar',
        condition: (data) => !data.isActive,
        readOnly: true,
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
    {
      name: 'newsletterOptIn',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Opt-in to receive the GCET Blog newsletter',
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
    {
      name: 'emailNotifications',
      type: 'group',
      admin: {
        description: 'Email notification preferences',
      },
      fields: [
        {
          name: 'onPostApproved',
          type: 'checkbox',
          defaultValue: true,
          label: 'Post Approved',
          admin: { description: 'Notify when your post is approved' },
        },
        {
          name: 'onPostRejected',
          type: 'checkbox',
          defaultValue: true,
          label: 'Post Rejected',
          admin: { description: 'Notify when your post is rejected' },
        },
        {
          name: 'onEditorFeedback',
          type: 'checkbox',
          defaultValue: true,
          label: 'Editor Feedback',
          admin: { description: 'Notify when editor provides feedback' },
        },
        {
          name: 'onCommentReply',
          type: 'checkbox',
          defaultValue: true,
          label: 'Comment Reply',
          admin: { description: 'Notify when someone replies to your comment' },
        },
        {
          name: 'newsletter',
          type: 'checkbox',
          defaultValue: false,
          label: 'Newsletter',
          admin: { description: 'Receive newsletter emails' },
        },
      ],
    },
  ],
  timestamps: true,
}
