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

import { hasPermission, publicOrInstitution } from '@/access/hasPermission'
import { clubAdminAccess } from '@/access/hasClubAccess'
import { institutionField } from '@/fields/institution'
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
    create: hasPermission('club:edit_page'),
    delete: hasPermission('club:edit_page'),
    read: publicOrInstitution(),
    update: clubAdminAccess,
  },
  admin: {
    defaultColumns: ['title', 'dataSource', 'classification', 'department', 'updatedAt'],
    useAsTitle: 'title',
    description: '🏛️ Clubs & societies from Conosco API or manually created. CMS adds SEO, images, and editorial content.',
  },
  fields: [
    institutionField,
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
        {
          label: 'Theme',
          description: 'Visual customization for this club\'s landing page',
          fields: [
            {
              name: 'theme',
              type: 'group',
              admin: {
                description: 'Per-club visual tokens. Applied as CSS custom properties on the club landing page.',
              },
              fields: [
                {
                  name: 'primaryColor',
                  type: 'text',
                  defaultValue: '#0047AB',
                  admin: {
                    description: 'Primary brand color (hex, e.g. #0047AB)',
                  },
                },
                {
                  name: 'accentColor',
                  type: 'text',
                  admin: {
                    description: 'Secondary accent color (hex)',
                  },
                },
                {
                  name: 'cardStyle',
                  type: 'select',
                  defaultValue: 'default',
                  options: [
                    { label: 'Default', value: 'default' },
                    { label: 'Glass', value: 'glass' },
                    { label: 'Bordered', value: 'bordered' },
                    { label: 'Elevated', value: 'elevated' },
                  ],
                  admin: {
                    description: 'Card rendering style on the club landing page',
                  },
                },
                {
                  name: 'fontPreset',
                  type: 'select',
                  defaultValue: 'default',
                  options: [
                    { label: 'Default (Inter)', value: 'default' },
                    { label: 'Modern (Space Grotesk)', value: 'modern' },
                    { label: 'Classic (Merriweather)', value: 'classic' },
                    { label: 'Technical (JetBrains Mono)', value: 'technical' },
                  ],
                  admin: {
                    description: 'Font family preset for the club landing page',
                  },
                },
              ],
            },
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
