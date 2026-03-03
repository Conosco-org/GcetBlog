/**
 * Clubs Collection — CMS Enhancement Layer
 *
 * Lightweight Payload collection for editorial enhancement of clubs.
 * Clubs can come from Conosco (dataSource: 'conosco') or be created
 * manually (dataSource: 'manual').
 *
 * Doctrine Rule 3: CMS enhances, never overwrites operational truth.
 * - CMS owns: slug, SEO, hero image, editorial description, featured status
 * - Conosco owns: members, advisor, coordinator, achievements, stats
 */

import type { CollectionConfig } from 'payload'

import { editorOnly } from '@/access/editorOnly'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { slugField } from '@/fields/slug'
import { getDepartmentOptions } from '@/custom/departments'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'

export const Clubs: CollectionConfig = {
  slug: 'clubs',
  access: {
    create: editorOnly,
    delete: editorOnly,
    read: authenticatedOrPublished,
    update: editorOnly,
  },
  admin: {
    defaultColumns: ['title', 'dataSource', 'classification', 'department', 'updatedAt'],
    useAsTitle: 'title',
    description: '🏛️ Clubs & societies from Conosco API or manually created. CMS adds SEO, images, and editorial content.',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Club Details',
          fields: [
            {
              name: 'heroImage',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Club banner/hero image (overrides Conosco logo for display)',
              },
            },
            {
              name: 'logo',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Club logo (used in cards and listings)',
              },
            },
            {
              name: 'editorialDescription',
              type: 'richText',
              admin: {
                description: 'Rich editorial content about the club. Conosco description is shown separately.',
              },
            },
            {
              name: 'classification',
              type: 'select',
              options: [
                { label: 'Technical', value: 'technical' },
                { label: 'Cultural', value: 'cultural' },
                { label: 'Sports', value: 'sports' },
                { label: 'Social', value: 'social' },
                { label: 'Professional', value: 'professional' },
                { label: 'Other', value: 'other' },
              ],
              admin: {
                description: 'Club classification. For Conosco clubs, this mirrors the API value.',
              },
            },
            {
              name: 'department',
              type: 'select',
              options: getDepartmentOptions(),
              admin: {
                position: 'sidebar',
                description: 'Affiliated department',
              },
            },
            // Manual club fields
            {
              name: 'manualStatus',
              type: 'select',
              defaultValue: 'active',
              options: [
                { label: 'Active', value: 'active' },
                { label: 'Inactive', value: 'inactive' },
              ],
              admin: {
                condition: (data) => data?.dataSource === 'manual',
                description: 'Status for manual clubs. Conosco clubs get status from API.',
              },
            },
            {
              name: 'socialLinks',
              type: 'group',
              admin: {
                condition: (data) => data?.dataSource === 'manual',
                description: 'Social media links for manual clubs',
              },
              fields: [
                { name: 'website', type: 'text' },
                { name: 'instagram', type: 'text' },
                { name: 'linkedin', type: 'text' },
                { name: 'twitter', type: 'text' },
                { name: 'github', type: 'text' },
              ],
            },
          ],
        },
        {
          label: 'Integration',
          fields: [
            {
              name: 'dataSource',
              type: 'select',
              required: true,
              defaultValue: 'manual',
              options: [
                { label: 'Manual (created in CMS)', value: 'manual' },
                { label: 'Conosco (synced from API)', value: 'conosco' },
              ],
              admin: {
                description: 'Where this club originates. Conosco clubs sync operational data from the API.',
              },
            },
            {
              name: 'conoscoClubCode',
              type: 'text',
              unique: true,
              index: true,
              admin: {
                condition: (data) => data?.dataSource === 'conosco',
                description: 'Semantic club code from Conosco (e.g., CLB-2025-0012). Used to link CMS record to API data.',
              },
            },
            {
              name: 'lastSyncedAt',
              type: 'date',
              admin: {
                condition: (data) => data?.dataSource === 'conosco',
                readOnly: true,
                description: 'Last time this record was synced with Conosco API',
              },
            },
          ],
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({ hasGenerateFn: true }),
            MetaImageField({ relationTo: 'media' }),
            MetaDescriptionField({}),
            PreviewField({
              hasGenerateFn: true,
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    // Sidebar fields
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Feature this club prominently on the clubs page',
      },
    },
    {
      name: 'relatedPosts',
      type: 'relationship',
      relationTo: 'posts',
      hasMany: true,
      admin: {
        position: 'sidebar',
        description: 'Blog posts related to this club',
      },
    },
    {
      name: 'tags',
      type: 'json',
      admin: {
        position: 'sidebar',
        description: 'Free-form tags (comma-separated)',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime' },
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData._status === 'published' && !value) {
              return new Date()
            }
            return value
          },
        ],
      },
    },
    ...slugField(),
  ],
  versions: {
    drafts: {
      autosave: {
        interval: 100,
      },
      schedulePublish: true,
    },
    maxPerDoc: 20,
  },
}
