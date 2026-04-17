import type { CollectionConfig } from 'payload'
import { isAdminOrEditor } from '@backend/access/is-admin-or-editor'
import {
  BlocksFeature,
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
  HorizontalRuleFeature,
} from '@payloadcms/richtext-lexical'
import { Banner } from '@backend/blocks/banner/config'
import { Code } from '@backend/blocks/code/config'
import { MediaBlock } from '@backend/blocks/media-block/config'

export const Newsletters: CollectionConfig = {
  slug: 'newsletters',
  labels: {
    singular: 'Newsletter',
    plural: 'Newsletters',
  },
  admin: {
    defaultColumns: ['title', 'subject', 'type', 'status', 'sentAt', 'createdAt'],
    useAsTitle: 'title',
    description: 'Newsletter campaigns - manual compose or auto-generated digests',
  },
  access: {
    read: isAdminOrEditor,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  versions: {
    drafts: {
      autosave: {
        interval: 2000,
      },
    },
    maxPerDoc: 25,
  },
  fields: [
    // ── Campaign Identity ─────────────────────────────────────────────
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: { description: 'Internal campaign name (not shown to subscribers)' },
    },
    {
      name: 'subject',
      type: 'text',
      required: true,
      admin: { description: 'Email subject line - seen in inbox' },
    },
    {
      name: 'previewText',
      type: 'text',
      admin: {
        description: 'Inbox preview snippet (appears after subject in most email clients)',
      },
    },

    // ── Type & Scheduling ─────────────────────────────────────────────
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'manual',
      options: [
        { label: 'Manual Compose', value: 'manual' },
        { label: 'Auto Digest', value: 'auto_digest' },
      ],
    },
    {
      name: 'frequency',
      type: 'select',
      options: [
        { label: 'Daily', value: 'daily' },
        { label: 'Weekly', value: 'weekly' },
        { label: 'Monthly', value: 'monthly' },
      ],
      admin: {
        description: 'Digest frequency (only for auto-digest type)',
        condition: (_, siblingData) => siblingData?.type === 'auto_digest',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Scheduled', value: 'scheduled' },
        { label: 'Sending', value: 'sending' },
        { label: 'Sent', value: 'sent' },
        { label: 'Failed', value: 'failed' },
      ],
    },
    {
      name: 'scheduledFor',
      type: 'date',
      admin: {
        description: 'When to send this campaign',
        date: { pickerAppearance: 'dayAndTime' },
        condition: (_, siblingData) =>
          siblingData?.status === 'scheduled' || siblingData?.status === 'draft',
      },
    },

    // ── Content ───────────────────────────────────────────────────────
    {
      name: 'content',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => [
          ...rootFeatures,
          HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
          BlocksFeature({ blocks: [Banner, Code, MediaBlock] }),
          FixedToolbarFeature(),
          InlineToolbarFeature(),
          HorizontalRuleFeature(),
        ],
      }),
      admin: {
        description: 'Newsletter body (for manual compose)',
        condition: (_, siblingData) => siblingData?.type === 'manual',
      },
    },
    {
      name: 'posts',
      type: 'relationship',
      relationTo: 'posts',
      hasMany: true,
      admin: {
        description: 'Posts included in this newsletter (auto-populated for digests)',
      },
    },

    // ── Targeting ─────────────────────────────────────────────────────
    {
      name: 'targetCategories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      admin: {
        description:
          'Target specific subscriber segments by category. Leave empty to send to all.',
      },
    },

    // ── Send Metadata ─────────────────────────────────────────────────
    {
      name: 'sentAt',
      type: 'date',
      admin: {
        readOnly: true,
        date: { pickerAppearance: 'dayAndTime' },
        position: 'sidebar',
      },
    },
    {
      name: 'sentBy',
      type: 'relationship',
      relationTo: 'users',
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'testRecipients',
      type: 'text',
      admin: {
        description: 'Comma-separated emails for test sends',
        position: 'sidebar',
      },
    },

    // ── Denormalized Stats (updated by rollup job) ────────────────────
    {
      name: 'stats',
      type: 'group',
      admin: { readOnly: true, description: 'Campaign statistics (auto-updated)' },
      fields: [
        { name: 'totalRecipients', type: 'number', defaultValue: 0 },
        { name: 'delivered', type: 'number', defaultValue: 0 },
        { name: 'opened', type: 'number', defaultValue: 0 },
        { name: 'clicked', type: 'number', defaultValue: 0 },
        { name: 'bounced', type: 'number', defaultValue: 0 },
        { name: 'unsubscribed', type: 'number', defaultValue: 0 },
      ],
    },

    // ── Template ──────────────────────────────────────────────────────
    {
      name: 'templateId',
      type: 'text',
      defaultValue: 'default',
      admin: {
        description: 'React Email template identifier',
        position: 'sidebar',
      },
    },
  ],
  timestamps: true,
}
