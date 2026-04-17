import type { CollectionConfig } from 'payload'

export const Notifications: CollectionConfig = {
  slug: 'notifications',
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      const u = user as { role?: string; id?: string }
      if (u.role === 'admin' || u.role === 'editor') return true
      return { recipient: { equals: u.id } }
    },
    create: () => false, // Only via hooks with overrideAccess: true
    update: ({ req: { user } }) => {
      if (!user) return false
      const u = user as { role?: string; id?: string }
      if (u.role === 'admin') return true
      return { recipient: { equals: u.id } }
    },
    delete: ({ req: { user } }) => {
      if (!user) return false
      const u = user as { role?: string; id?: string }
      if (u.role === 'admin') return true
      return { recipient: { equals: u.id } }
    },
  },
  admin: {
    defaultColumns: ['recipient', 'type', 'title', 'isRead', 'createdAt'],
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'recipient',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Post Approved', value: 'post_approved' },
        { label: 'Post Rejected', value: 'post_rejected' },
        { label: 'Feedback Received', value: 'feedback_received' },
        { label: 'Comment Reply', value: 'comment_replied' },
        { label: 'Comment on Post', value: 'post_commented' },
        { label: 'Comment Flagged', value: 'comment_flagged' },
        { label: 'Role Changed', value: 'role_changed' },
      ],
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'message',
      type: 'textarea',
    },
    {
      name: 'link',
      type: 'text',
      admin: {
        description: 'URL to navigate to when notification is clicked',
      },
    },
    {
      name: 'relatedPost',
      type: 'relationship',
      relationTo: 'posts',
    },
    {
      name: 'relatedComment',
      type: 'relationship',
      relationTo: 'comments',
    },
    {
      name: 'triggeredBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'The person whose action caused this notification',
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
