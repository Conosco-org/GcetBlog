import type { CollectionConfig } from 'payload'
import type { AdminLog } from '@shared/types/payload-types'

import { isAuthenticated } from '@backend/access/is-authenticated'
import { isAdminOrEditor } from '@backend/access/is-admin-or-editor'

export const Templates: CollectionConfig = {
  slug: 'templates',
  access: {
    create: isAdminOrEditor,
    delete: isAdminOrEditor,
    read: isAuthenticated,
    update: isAdminOrEditor,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'audience', 'usageCount', 'updatedAt'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Template Name',
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Only published templates are visible to contributors.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      admin: {
        description: 'A short description of what this template is for',
      },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Academic', value: 'academic' },
        { label: 'General', value: 'general' },
        { label: 'Editorial', value: 'editorial' },
        { label: 'News', value: 'news' },
      ],
      defaultValue: 'general',
    },
    {
      name: 'contentType',
      type: 'select',
      label: 'Content Type',
      admin: {
        description: 'Maps to contributor content types',
      },
      options: [
        { label: 'News Article', value: 'news' },
        { label: 'Event Coverage', value: 'event' },
        { label: 'Literary Post', value: 'literary' },
        { label: 'Media Post', value: 'media' },
        { label: 'Tutorial/Guide', value: 'tutorial' },
        { label: 'Academic Content', value: 'academic' },
      ],
    },
    {
      name: 'audience',
      type: 'select',
      required: true,
      options: [
        { label: 'Everyone', value: 'all' },
        { label: 'Editors Only', value: 'editor_only' },
        { label: 'Contributors Only', value: 'contributor_only' },
      ],
      defaultValue: 'all',
    },
    {
      name: 'content',
      type: 'textarea',
      required: true,
      label: 'Template Content (HTML)',
      admin: {
        description: 'Tiptap-compatible HTML content that will be pre-filled in the editor',
        rows: 20,
      },
    },
    {
      name: 'suggestedTitle',
      type: 'text',
      label: 'Suggested Title',
      admin: {
        description: 'Pre-filled title placeholder (user will modify)',
      },
    },
    {
      name: 'suggestedTags',
      type: 'json',
      label: 'Suggested Tags',
      admin: {
        description: 'Array of tag strings, e.g. ["gcet", "event", "2026"]',
      },
    },
    {
      name: 'icon',
      type: 'select',
      label: 'Template Icon',
      options: [
        { label: 'Calendar (Events)', value: 'calendar' },
        { label: 'Graduation Cap (Academic)', value: 'graduation' },
        { label: 'File Text (Article)', value: 'file-text' },
        { label: 'Lightbulb (Tutorial)', value: 'lightbulb' },
        { label: 'Users (Interview)', value: 'users' },
        { label: 'Trophy (Achievement)', value: 'trophy' },
        { label: 'Book (Review)', value: 'book' },
        { label: 'Code (Technical)', value: 'code' },
        { label: 'Megaphone (Announcement)', value: 'megaphone' },
        { label: 'Star (Featured)', value: 'star' },
        { label: 'Briefcase (Placement)', value: 'briefcase' },
        { label: 'List (Listicle)', value: 'list' },
      ],
      defaultValue: 'file-text',
    },
    {
      name: 'usageCount',
      type: 'number',
      label: 'Times Used',
      defaultValue: 0,
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ req, operation, data }) => {
        if (operation === 'create' && req.user) {
          data.createdBy = req.user.id
        }
        return data
      },
    ],
    afterChange: [
      async ({ req, doc, previousDoc, operation }) => {
        if (!req.user) return doc

        try {
          let action: string
          if (operation === 'create') {
            action = 'template_created'
          } else if (previousDoc?.status !== 'published' && doc.status === 'published') {
            action = 'template_published'
          } else if (previousDoc?.status === 'published' && doc.status !== 'published') {
            action = 'template_unpublished'
          } else {
            action = 'template_updated'
          }

          await req.payload.create({
            collection: 'admin-logs',
            data: {
              action: action as AdminLog['action'],
              resourceType: 'templates',
              resourceId: String(doc.id),
              user: req.user.id,
              details: `Template "${doc.name}" - ${action.replace('template_', '').replace('_', ' ')}`,
              timestamp: new Date().toISOString(),
            },
          })
        } catch {
          // Silently fail - logging is non-critical
        }

        return doc
      },
    ],
    afterDelete: [
      async ({ req, doc }) => {
        if (!req.user) return doc

        try {
          await req.payload.create({
            collection: 'admin-logs',
            data: {
              action: 'template_deleted',
              resourceType: 'templates',
              resourceId: String(doc.id),
              user: req.user.id,
              details: `Template "${doc.name}" deleted`,
              timestamp: new Date().toISOString(),
            },
          })
        } catch {
          // Silently fail - logging is non-critical
        }

        return doc
      },
    ],
  },
}
