import type { CollectionConfig, Where } from 'payload'
import { isAdminOrEditor } from '@backend/access/is-admin-or-editor'

/** Field-level access helper: checks if the requesting user is an editor or admin */
const isEditorFieldAccess = ({ req }: { req: { user: unknown } }): boolean => {
  const user = req.user as { role?: string } | undefined
  return user?.role === 'editor' || user?.role === 'admin'
}

export const Comments: CollectionConfig = {
  slug: 'comments',
  access: {
    read: ({ req }) => {
      const user = req.user as { role?: string; id?: string } | undefined
      // Editors can see all comments
      if (user?.role === 'editor' || user?.role === 'admin') return true

      // Users can see their own comments + approved ones + comments they reported
      if (user && user.id) {
        return {
          or: [
            { author: { equals: user.id } },
            { status: { equals: 'approved' } },
            { reportedBy: { equals: user.id } },
          ],
        } as Where
      }

      // Public can see only approved comments
      return {
        status: { equals: 'approved' },
      }
    },
    create: () => true, // Anyone can create comments (we'll validate in hooks)
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  admin: {
    defaultColumns: ['post', 'author', 'content', 'status', 'createdAt'],
    useAsTitle: 'content',
  },
  // Database indexes for performance optimization
  indexes: [
    {
      fields: ['status'],
    },
    {
      fields: ['post'],
    },
    {
      fields: ['post', 'status'],
    },
  ],
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
        { label: 'Archived', value: 'archived' },
      ],
      defaultValue: 'pending',
      access: {
        update: isEditorFieldAccess,
      },
    },
    {
      name: 'reviewQueueAgeStartedAt',
      type: 'date',
      admin: {
        readOnly: true,
        description: 'When the current pending moderation queue age started.',
      },
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'comments',
      admin: {
        description: 'Parent comment (for replies/threading)',
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
      name: 'spamType',
      type: 'select',
      options: [
        { label: 'Commercial', value: 'commercial' },
        { label: 'Malicious', value: 'malicious' },
        { label: 'Off-topic', value: 'off-topic' },
        { label: 'Abusive', value: 'abusive' },
        { label: 'Bot-generated', value: 'bot-generated' },
      ],
      admin: {
        description: 'Type of spam (when marked as spam)',
        condition: (data) => data.status === 'spam',
      },
      access: {
        read: isEditorFieldAccess,
      },
    },
    {
      name: 'rejectionReason',
      type: 'select',
      options: [
        { label: 'Violates Guidelines', value: 'violates guidelines' },
        { label: 'Spam', value: 'spam' },
        { label: 'Off-topic', value: 'off-topic' },
        { label: 'Inappropriate Language', value: 'inappropriate language' },
        { label: 'Duplicate', value: 'duplicate' },
        { label: 'Other', value: 'other' },
      ],
      admin: {
        description: 'Reason for rejecting this comment',
        condition: (data) => data.status === 'rejected',
      },
      access: {
        read: isEditorFieldAccess,
      },
    },
    {
      name: 'rejectionReasonCustom',
      type: 'textarea',
      admin: {
        description: 'Custom rejection reason (when "other" is selected)',
        condition: (data) => data.rejectionReason === 'other',
      },
      access: {
        read: isEditorFieldAccess,
      },
    },
    {
      name: 'contentModified',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Indicates if comment content was modified by an editor',
        readOnly: true,
      },
    },
    {
      name: 'revisionHistory',
      type: 'array',
      admin: {
        description: 'History of content modifications',
      },
      access: {
        read: isEditorFieldAccess,
      },
      fields: [
        {
          name: 'originalContent',
          type: 'textarea',
          required: true,
        },
        {
          name: 'modifiedBy',
          type: 'relationship',
          relationTo: 'users',
          required: true,
        },
        {
          name: 'modifiedAt',
          type: 'date',
          required: true,
        },
        {
          name: 'reason',
          type: 'text',
          required: true,
        },
      ],
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
    {
      name: 'reportedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'User who reported this comment',
      },
    },
    {
      name: 'reportReason',
      type: 'textarea',
      admin: {
        description: 'Reason for reporting this comment',
        condition: (data) => !!data.reportedBy,
      },
    },
    {
      name: 'reportedAt',
      type: 'date',
      admin: {
        description: 'When this comment was reported',
        readOnly: true,
        condition: (data) => !!data.reportedBy,
      },
    },
    {
      name: 'reportResolvedAt',
      type: 'date',
      admin: {
        description: 'When the report was resolved',
        readOnly: true,
        condition: (data) => !!data.reportedBy,
      },
      access: {
        read: isEditorFieldAccess,
      },
    },
    {
      name: 'reportResolutionAction',
      type: 'select',
      options: [
        { label: 'No Action', value: 'no-action' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Marked as Spam', value: 'spam' },
      ],
      admin: {
        description: 'Action taken to resolve the report',
        condition: (data) => !!data.reportResolvedAt,
      },
      access: {
        read: isEditorFieldAccess,
        update: isEditorFieldAccess,
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ req, operation, data, originalDoc }) => {
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

        if (operation === 'create' && data.status === 'pending') {
          data.reviewQueueAgeStartedAt = data.reviewQueueAgeStartedAt || new Date()
        }

        if (operation === 'update' && originalDoc) {
          const previousStatus = originalDoc.status
          const nextStatus = data.status

          if (previousStatus !== 'pending' && nextStatus === 'pending') {
            data.reviewQueueAgeStartedAt = new Date()
          }

          if (previousStatus === 'pending' && nextStatus && nextStatus !== 'pending') {
            data.reviewQueueAgeStartedAt = null
          }
        }
      },
    ],
  },
  timestamps: true,
}
