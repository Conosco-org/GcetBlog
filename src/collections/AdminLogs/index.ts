import type { CollectionConfig } from 'payload'
import { editorOnly } from '../../access/editorOnly'

export const AdminLogs: CollectionConfig = {
  slug: 'admin-logs',
  access: {
    read: editorOnly,
    create: editorOnly,
    update: () => false, // Logs should be immutable
    delete: () => false, // Logs should not be deleted
  },
  admin: {
    defaultColumns: ['action', 'resourceType', 'user', 'timestamp'],
    useAsTitle: 'action',
  },
  fields: [
    {
      name: 'action',
      type: 'select',
      options: [
        { label: 'Approve Post', value: 'approve_post' },
        { label: 'Reject Post', value: 'reject_post' },
        { label: 'Delete Post', value: 'delete_post' },
        { label: 'Unpublish Post', value: 'unpublish_post' },
        { label: 'Approve Comment', value: 'approve_comment' },
        { label: 'Reject Comment', value: 'reject_comment' },
        { label: 'Mark Comment as Spam', value: 'spam_comment' },
        { label: 'Comment Reported', value: 'comment_reported' },
        { label: 'Role Change', value: 'role_change' },
        { label: 'User Action', value: 'user_action' },
        { label: 'Content Moderation', value: 'content_moderation' },
      ],
      required: true,
    },
    {
      name: 'resourceType',
      type: 'select',
      options: [
        { label: 'Posts', value: 'posts' },
        { label: 'Comments', value: 'comments' },
        { label: 'Users', value: 'users' },
        { label: 'Media', value: 'media' },
      ],
      required: true,
    },
    {
      name: 'resourceId',
      type: 'text',
      required: true,
      admin: {
        description: 'ID of the affected resource',
      },
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'User who performed the action',
      },
    },
    {
      name: 'details',
      type: 'textarea',
      admin: {
        description: 'Additional details about the action',
      },
    },
    {
      name: 'timestamp',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'ipAddress',
      type: 'text',
      admin: {
        description: 'IP address of the user',
      },
    },
  ],
  timestamps: true,
}
