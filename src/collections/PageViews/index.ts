import type { CollectionConfig } from 'payload'

export const PageViews: CollectionConfig = {
  slug: 'page-views',
  access: {
    // Only editors/admins can read analytics
    read: ({ req }) => {
      const user = req.user as { role?: string } | undefined
      return user ? ['editor', 'admin'].includes(user.role || '') : false
    },
    // Anyone can create (tracked via middleware/API)
    create: () => true,
    // Analytics are immutable
    update: () => false,
    delete: ({ req }) => {
      const user = req.user as { role?: string } | undefined
      return user?.role === 'admin'
    },
  },
  admin: {
    defaultColumns: ['path', 'postSlug', 'createdAt'],
    hidden: true,
  },
  fields: [
    {
      name: 'path',
      type: 'text',
      required: true,
      index: true,
      admin: {
        description: 'The URL path that was viewed',
      },
    },
    {
      name: 'post',
      type: 'relationship',
      relationTo: 'posts',
      index: true,
      admin: {
        description: 'The post that was viewed (null for non-post pages)',
      },
    },
    {
      name: 'postSlug',
      type: 'text',
      index: true,
      admin: {
        description: 'Slug of the post (for fast lookups without join)',
      },
    },
    {
      name: 'sessionId',
      type: 'text',
      index: true,
      admin: {
        description: 'Anonymous session identifier for unique visitor tracking',
      },
    },
    {
      name: 'referrer',
      type: 'text',
      admin: {
        description: 'The referrer URL',
      },
    },
    {
      name: 'userAgent',
      type: 'text',
    },
    {
      name: 'country',
      type: 'text',
      admin: {
        description: 'Country from geo lookup (if available)',
      },
    },
    {
      name: 'device',
      type: 'select',
      options: [
        { label: 'Desktop', value: 'desktop' },
        { label: 'Mobile', value: 'mobile' },
        { label: 'Tablet', value: 'tablet' },
        { label: 'Unknown', value: 'unknown' },
      ],
      defaultValue: 'unknown',
    },
    {
      name: 'browser',
      type: 'text',
    },
    {
      name: 'viewedAt',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      index: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
  ],
  timestamps: true,
}
