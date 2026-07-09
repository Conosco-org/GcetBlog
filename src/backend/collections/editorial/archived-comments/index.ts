import type { CollectionConfig } from 'payload'

const isEditorOrAdmin = (user: unknown): boolean => {
  const typedUser = user as { role?: string; isAdmin?: boolean } | undefined
  return typedUser?.role === 'editor' || typedUser?.role === 'admin' || typedUser?.isAdmin === true
}

export const ArchivedComments: CollectionConfig = {
  slug: 'archived-comments',
  access: {
    create: ({ req: { user } }) => isEditorOrAdmin(user),
    read: ({ req: { user } }) => isEditorOrAdmin(user),
    update: ({ req: { user } }) => isEditorOrAdmin(user),
    delete: ({ req: { user } }) => isEditorOrAdmin(user),
  },
  admin: {
    group: 'Editorial',
    defaultColumns: ['contentSnapshot', 'post', 'authorName', 'archiveReason', 'archivedAt'],
    useAsTitle: 'contentSnapshot',
  },
  indexes: [
    { fields: ['comment'] },
    { fields: ['post'] },
    { fields: ['archivedAt'] },
  ],
  fields: [
    {
      name: 'comment',
      type: 'relationship',
      relationTo: 'comments',
      required: true,
      admin: {
        description: 'Source pending comment retained until archive expiry.',
      },
    },
    {
      name: 'contentSnapshot',
      type: 'textarea',
      required: true,
    },
    {
      name: 'post',
      type: 'relationship',
      relationTo: 'posts',
      required: true,
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'authorName',
      type: 'text',
    },
    {
      name: 'authorEmail',
      type: 'email',
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
      name: 'reviewQueueAgeStartedAt',
      type: 'date',
      admin: {
        readOnly: true,
        description: 'Queue age timestamp from the source comment when archived.',
      },
    },
  ],
  timestamps: true,
}
