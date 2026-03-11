import type { CollectionConfig } from 'payload'
import { v4 as uuidv4 } from 'uuid'
import { hasPermissionFilter } from '../../access/hasPermission'
import { anyone } from '../../access/anyone'
import { withTenantIsolation } from '@/hooks/tenantIsolation'

export const NewsletterSubscribers: CollectionConfig = {
  slug: 'newsletter-subscribers',
  labels: {
    singular: 'Newsletter Subscriber',
    plural: 'Newsletter Subscribers',
  },
  admin: {
    defaultColumns: ['email', 'name', 'status', 'source', 'frequency', 'createdAt'],
    useAsTitle: 'email',
    description: 'Email subscribers for the GCET Blog newsletter',
  },
  access: {
    // Blog editors manage subscribers within their institution
    read: hasPermissionFilter('blog:publish', 'user', 'institution'),
    update: hasPermissionFilter('blog:publish', 'user', 'institution'),
    delete: hasPermissionFilter('blog:publish', 'user', 'institution'),
    // Public can subscribe (create) via the subscribe endpoint
    create: anyone,
  },
  hooks: withTenantIsolation({
    beforeChange: [
      // Auto-generate unsubscribe token on creation
      ({ data, operation }) => {
        if (operation === 'create' && data && !data.unsubscribeToken) {
          data.unsubscribeToken = uuidv4()
        }
        // Set unsubscribedAt when status changes to 'unsubscribed'
        if (data?.status === 'unsubscribed' && !data.unsubscribedAt) {
          data.unsubscribedAt = new Date().toISOString()
        }
        return data
      },
    ],
  }),
  indexes: [
    { fields: ['email'], unique: true },
    { fields: ['email', 'status'] },
    { fields: ['unsubscribeToken'], unique: true },
    { fields: ['status', 'frequency'] },
  ],
  fields: [
    {
      name: 'institution',
      type: 'relationship',
      relationTo: 'institutions',
      required: false,
      admin: {
        position: 'sidebar',
        description: 'The institution this subscriber belongs to (optional for public signups)',
      },
    },
    {
      name: 'email',
      type: 'email',
      required: true,
    },
    {
      name: 'name',
      type: 'text',
      admin: { description: 'Display name (optional)' },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending Confirmation', value: 'pending' },
        { label: 'Active', value: 'active' },
        { label: 'Unsubscribed', value: 'unsubscribed' },
        { label: 'Bounced', value: 'bounced' },
        { label: 'Complained', value: 'complained' },
      ],
      admin: {
        description: 'Subscription status. New subscribers start as "pending" until confirmed.',
      },
    },
    {
      name: 'source',
      type: 'select',
      required: true,
      defaultValue: 'public_form',
      options: [
        { label: 'Public Signup Form', value: 'public_form' },
        { label: 'User Registration', value: 'user_registration' },
        { label: 'Admin Import', value: 'admin_import' },
        { label: 'API', value: 'api' },
      ],
      admin: { description: 'How this subscriber was added' },
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      admin: { description: 'Linked registered user (if applicable)' },
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      admin: {
        description: 'Content preferences - only receive digests about these categories',
      },
    },
    {
      name: 'frequency',
      type: 'select',
      defaultValue: 'weekly',
      options: [
        { label: 'Daily', value: 'daily' },
        { label: 'Weekly', value: 'weekly' },
        { label: 'Monthly', value: 'monthly' },
      ],
      admin: { description: 'How often they want digest emails' },
    },
    {
      name: 'unsubscribeToken',
      type: 'text',
      admin: {
        description: 'Unique token for one-click unsubscribe (auto-generated)',
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'confirmedAt',
      type: 'date',
      admin: {
        description: 'When the subscriber confirmed their email (double opt-in)',
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'unsubscribedAt',
      type: 'date',
      admin: {
        description: 'When the subscriber unsubscribed',
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Extensible metadata (UTM source, signup page, etc.)',
        position: 'sidebar',
      },
    },
  ],
  timestamps: true,
}
