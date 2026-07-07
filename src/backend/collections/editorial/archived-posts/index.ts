import type { CollectionConfig } from 'payload'

const isEditorOrAdmin = (user: unknown): boolean => {
  const typedUser = user as { role?: string; isAdmin?: boolean } | undefined
  return typedUser?.role === 'editor' || typedUser?.role === 'admin' || typedUser?.isAdmin === true
}

export const ArchivedPosts: CollectionConfig = {
  slug: 'archived-posts',
  access: {
    create: ({ req: { user } }) => isEditorOrAdmin(user),
    read: ({ req: { user } }) => isEditorOrAdmin(user),
    update: ({ req: { user } }) => isEditorOrAdmin(user),
    delete: ({ req: { user } }) => isEditorOrAdmin(user),
  },
  admin: {
    group: 'Editorial',
    defaultColumns: ['postTitle', 'contributor', 'archiveReason', 'archivedAt'],
    useAsTitle: 'postTitle',
  },
  indexes: [
    {
      fields: ['post'],
    },
    {
      fields: ['contributor'],
    },
    {
      fields: ['archivedAt'],
    },
  ],
  fields: [
    {
      name: 'post',
      type: 'relationship',
      relationTo: 'posts',
      required: true,
      admin: {
        description: 'Original post that carries the contributor-facing status message.',
      },
    },
    {
      name: 'postTitle',
      type: 'text',
      required: true,
    },
    {
      name: 'contributor',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'archivedAt',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'archivedBy',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'archiveReason',
      type: 'select',
      required: true,
      defaultValue: 'manual',
      options: [
        { label: 'Automated', value: 'automated' },
        { label: 'Manual', value: 'manual' },
      ],
    },
    {
      name: 'statusMessage',
      type: 'textarea',
      required: true,
    },
    {
      name: 'reviewQueueAgeStartedAt',
      type: 'date',
      admin: {
        readOnly: true,
        description: 'Review queue age timestamp from the source post when it was archived.',
      },
    },
  ],
  timestamps: true,
}
