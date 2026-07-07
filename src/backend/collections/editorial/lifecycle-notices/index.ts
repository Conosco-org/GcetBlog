import type { CollectionConfig, Where } from 'payload'

const isEditorOrAdmin = (user: unknown): boolean => {
  const role = (user as { role?: string } | undefined)?.role
  return role === 'editor' || role === 'admin'
}

export const LifecycleNotices: CollectionConfig = {
  slug: 'lifecycle-notices',
  access: {
    create: ({ req: { user } }) => isEditorOrAdmin(user),
    read: ({ req: { user } }) => {
      if (isEditorOrAdmin(user)) return true

      const typedUser = user as { id?: string; role?: string } | undefined
      if (typedUser?.role === 'contributor' && typedUser.id) {
        return {
          contributor: {
            equals: typedUser.id,
          },
        } as Where
      }

      return false
    },
    update: ({ req: { user } }) => isEditorOrAdmin(user),
    delete: ({ req: { user } }) => isEditorOrAdmin(user),
  },
  admin: {
    group: 'Editorial',
    defaultColumns: ['postTitle', 'contributor', 'type', 'createdAt'],
    useAsTitle: 'postTitle',
  },
  indexes: [
    {
      fields: ['contributor'],
    },
    {
      fields: ['post'],
    },
    {
      fields: ['type'],
    },
  ],
  fields: [
    {
      name: 'post',
      type: 'relationship',
      relationTo: 'posts',
      admin: {
        description: 'Post that triggered this lifecycle notice.',
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
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Archived', value: 'archived' },
        { label: 'Deleted', value: 'deleted' },
        { label: 'Restored', value: 'restored' },
      ],
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'Editor/admin who triggered the notice. Empty for automated lifecycle jobs.',
      },
    },
    {
      name: 'isRead',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'readAt',
      type: 'date',
      admin: {
        readOnly: true,
      },
    },
  ],
  timestamps: true,
}
