import type { CollectionConfig } from 'payload'
import { editorOnly } from '../../access/editorOnly'

export const NewsletterEvents: CollectionConfig = {
  slug: 'newsletter-events',
  labels: {
    singular: 'Newsletter Event',
    plural: 'Newsletter Events',
  },
  admin: {
    defaultColumns: ['type', 'newsletter', 'subscriber', 'timestamp'],
    useAsTitle: 'type',
    description: 'Immutable event log for newsletter analytics (opens, clicks, bounces)',
  },
  access: {
    // Editors can view analytics
    read: editorOnly,
    // System-only creation (via server actions / tracking endpoints)
    create: () => true,
    // Immutable — no updates or deletes
    update: () => false,
    delete: () => false,
  },
  indexes: [
    { fields: ['newsletter', 'type'] },
    { fields: ['subscriber', 'type'] },
    { fields: ['newsletter', 'subscriber', 'type'] },
    { fields: ['timestamp'] },
  ],
  fields: [
    {
      name: 'newsletter',
      type: 'relationship',
      relationTo: 'newsletters',
      required: true,
      index: true,
    },
    {
      name: 'subscriber',
      type: 'relationship',
      relationTo: 'newsletter-subscribers',
      index: true,
      admin: { description: 'Null for anonymized/aggregated events' },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Sent', value: 'sent' },
        { label: 'Delivered', value: 'delivered' },
        { label: 'Opened', value: 'opened' },
        { label: 'Clicked', value: 'clicked' },
        { label: 'Bounced', value: 'bounced' },
        { label: 'Complained', value: 'complained' },
        { label: 'Unsubscribed', value: 'unsubscribed' },
      ],
    },
    {
      name: 'url',
      type: 'text',
      admin: { description: 'Clicked URL (for click events only)' },
    },
    {
      name: 'userAgent',
      type: 'text',
      admin: { description: 'Browser/email client info' },
    },
    {
      name: 'ipAddress',
      type: 'text',
      admin: { description: 'IP address (for geographic context)' },
    },
    {
      name: 'timestamp',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        readOnly: true,
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
  ],
  timestamps: true,
}
