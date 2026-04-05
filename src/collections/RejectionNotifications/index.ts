import type { CollectionConfig } from 'payload'

export const RejectionNotifications: CollectionConfig = {
  slug: 'rejection-notifications',
  admin: {
    useAsTitle: 'postTitle',
    defaultColumns: ['postTitle', 'contributor', 'rejectedBy', 'createdAt'],
    hidden: ({ user }) => {
      const userRole = (user as { role?: string })?.role
      return userRole === 'admin'
    },
  },
  access: {
    create: ({ req: { user } }) => {
      const userRole = (user as { role?: string })?.role
      return userRole === 'editor' || userRole === 'admin'
    },
    read: ({ req: { user } }) => {
      const userRole = (user as { role?: string })?.role
      const userId = user?.id

      // Editors and admins can see all
      if (userRole === 'editor' || userRole === 'admin') {
        return true
      }

      // Contributors can only see their own
      if (userRole === 'contributor') {
        return {
          contributor: {
            equals: userId,
          },
        }
      }

      return false
    },
    update: () => false, // Read-only after creation
    delete: ({ req: { user } }) => {
      const userRole = (user as { role?: string })?.role
      const userId = user?.id

      // Contributors can delete their own notifications
      if (userRole === 'contributor') {
        return {
          contributor: {
            equals: userId,
          },
        }
      }

      // Editors and admins can delete any
      return userRole === 'editor' || userRole === 'admin'
    },
  },
  fields: [
    {
      name: 'postTitle',
      type: 'text',
      required: true,
      admin: {
        description: 'Title of the rejected post',
      },
    },
    {
      name: 'contributor',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'The contributor whose post was rejected',
      },
    },
    {
      name: 'rejectedBy',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'The editor who rejected the post',
      },
    },
    {
      name: 'reason',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Reason for rejection',
      },
    },
    {
      name: 'originalPostId',
      type: 'text',
      required: true,
      admin: {
        description: 'ID of the original post (for reference)',
      },
    },
    {
      name: 'isRead',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether the contributor has read this notification',
      },
    },
  ],
  timestamps: true,
}
