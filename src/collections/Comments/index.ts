import type { CollectionConfig, Where } from 'payload'
import { editorOnly } from '../../access/editorOnly'

/** Field-level access helper: checks if the requesting user is an editor */
const isEditorFieldAccess = ({ req }: { req: { user: unknown } }): boolean => {
  const user = req.user as { role?: string } | undefined
  return user?.role === 'editor'
}

export const Comments: CollectionConfig = {
  slug: 'comments',
  access: {
    read: ({ req }) => {
      const user = req.user as { role?: string; id?: string } | undefined
      // Editors can see all comments
      if (user?.role === 'editor') return true

      // Users can see their own comments + approved ones
      if (user && user.id) {
        return {
          or: [
            { author: { equals: user.id } },
            { status: { equals: 'approved' } },
          ],
        } as Where
      }

      // Public can see only approved comments
      return {
        status: { equals: 'approved' },
      }
    },
    create: () => true, // Anyone can create comments (we'll validate in hooks)
    update: editorOnly,
    delete: editorOnly,
  },
  admin: {
    defaultColumns: ['post', 'author', 'content', 'status', 'createdAt'],
    useAsTitle: 'content',
  },
  fields: [
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
      admin: {
        description: 'Comment author (optional for anonymous comments)',
      },
    },
    {
      name: 'authorName',
      type: 'text',
      admin: {
        condition: (data) => !data.author,
        description: 'Name for anonymous comments',
      },
    },
    {
      name: 'authorEmail',
      type: 'email',
      admin: {
        condition: (data) => !data.author,
        description: 'Email for anonymous comments (not displayed publicly)',
      },
    },
    {
      name: 'content',
      type: 'textarea',
      required: true,
      validate: (val) => {
        if (!val || val.length < 3) {
          return 'Comment must be at least 3 characters long'
        }
        if (val.length > 1000) {
          return 'Comment must be less than 1000 characters'
        }
        return true
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Spam', value: 'spam' },
      ],
      defaultValue: 'pending',
      access: {
        update: isEditorFieldAccess,
      },
    },
    {
      name: 'moderatorNotes',
      type: 'textarea',
      admin: {
        description: 'Internal notes for moderators',
      },
      access: {
        read: isEditorFieldAccess,
        update: isEditorFieldAccess,
      },
    },
    {
      name: 'moderatedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'Editor who moderated this comment',
        readOnly: true,
      },
      access: {
        read: isEditorFieldAccess,
      },
    },
    {
      name: 'moderatedAt',
      type: 'date',
      admin: {
        description: 'When this comment was moderated',
        readOnly: true,
      },
      access: {
        read: isEditorFieldAccess,
      },
    },
    {
      name: 'reportedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'User who reported this comment',
        readOnly: true,
      },
      access: {
        read: isEditorFieldAccess,
      },
    },
    {
      name: 'reportReason',
      type: 'text',
      admin: {
        description: 'Reason for reporting this comment',
        readOnly: true,
      },
      access: {
        read: isEditorFieldAccess,
      },
    },
    {
      name: 'reportedAt',
      type: 'date',
      admin: {
        description: 'When this comment was reported',
        readOnly: true,
      },
      access: {
        read: isEditorFieldAccess,
      },
    },
    {
      name: 'ipAddress',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'IP address of the commenter',
      },
      access: {
        read: isEditorFieldAccess,
      },
    },
    {
      name: 'userAgent',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'User agent of the commenter',
      },
      access: {
        read: isEditorFieldAccess,
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ req, operation, data }) => {
        // Auto-approve comments from editors
        if (operation === 'create' && req.user) {
          const user = req.user as { role: string }
          if (user.role === 'editor') {
            data.status = 'approved'
          }
        }

        // Set IP address and user agent for new comments
        if (operation === 'create') {
          // IP address will be set by the server action that creates the comment
          data.ipAddress = data.ipAddress || 'unknown'
          data.userAgent = req.headers.get?.('user-agent') || 'unknown'
        }

        // Set author from authenticated user if not provided
        if (operation === 'create' && req.user && !data.author) {
          data.author = req.user.id
        }
      },
    ],
  },
  timestamps: true,
}
