import type { CollectionConfig } from 'payload'
import { hasPermission, hasPermissionFilter } from '../../access/hasPermission'
import { institutionField } from '../../fields/institution'
import { tenantIsolationHooks } from '@/hooks/tenantIsolation'

export const AdminLogs: CollectionConfig = {
  slug: 'admin-logs',
  access: {
    read: hasPermissionFilter('logs:read', 'id', 'institution'),
    create: hasPermission('logs:read'),
    update: () => false, // Logs should be immutable
    delete: () => false, // Logs should not be deleted
  },
  admin: {
    defaultColumns: ['action', 'resourceType', 'user', 'timestamp'],
    useAsTitle: 'action',
  },
  hooks: tenantIsolationHooks(),
  fields: [
    institutionField,
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
        { label: 'Newsletter Sent', value: 'newsletter_sent' },
        { label: 'Newsletter Scheduled', value: 'newsletter_scheduled' },
        { label: 'Newsletter Deleted', value: 'newsletter_deleted' },
        { label: 'Digest Generated', value: 'digest_generated' },
        { label: 'Subscriber Imported', value: 'subscriber_imported' },
        { label: 'Subscriber Exported', value: 'subscriber_exported' },
        { label: 'Subscriber Status Changed', value: 'subscriber_status_changed' },
        { label: 'Template Created', value: 'template_created' },
        { label: 'Template Updated', value: 'template_updated' },
        { label: 'Template Published', value: 'template_published' },
        { label: 'Template Unpublished', value: 'template_unpublished' },
        { label: 'Template Deleted', value: 'template_deleted' },
        { label: 'Event Created', value: 'event_created' },
        { label: 'Event Updated', value: 'event_updated' },
        { label: 'Event Synced', value: 'event_synced' },
        { label: 'Event Deleted', value: 'event_deleted' },
        { label: 'Club Created', value: 'club_created' },
        { label: 'Club Updated', value: 'club_updated' },
        { label: 'Club Synced', value: 'club_synced' },
        { label: 'Club Deleted', value: 'club_deleted' },
        { label: 'Cache Revalidated', value: 'cache_revalidated' },
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
        { label: 'Newsletters', value: 'newsletters' },
        { label: 'Newsletter Subscribers', value: 'newsletter-subscribers' },
        { label: 'Templates', value: 'templates' },
        { label: 'Events', value: 'events' },
        { label: 'Clubs', value: 'clubs' },
        { label: 'System', value: 'system' },
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
      name: 'module',
      type: 'select',
      options: [
        { label: 'Content', value: 'content' },
        { label: 'Events', value: 'events' },
        { label: 'Clubs', value: 'clubs' },
        { label: 'Media', value: 'media' },
        { label: 'Newsletter', value: 'newsletter' },
        { label: 'Users', value: 'users' },
        { label: 'System', value: 'system' },
      ],
      admin: {
        description: 'Which module generated this log entry',
      },
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Additional structured data about the action (flexible JSON)',
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
