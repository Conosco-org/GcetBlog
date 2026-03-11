/**
 * Events Collection — CMS Enhancement Layer
 *
 * Lightweight Payload collection for editorial enhancement of events.
 * Events can come from Conosco (dataSource: 'conosco') or be created
 * manually (dataSource: 'manual').
 *
 * Doctrine Rule 3: CMS enhances, never overwrites operational truth.
 * - CMS owns: slug, SEO, hero image, editorial description, featured status
 * - Conosco owns: dates, venue, registration, attendance, status, evidence
 */

import type { CollectionConfig } from 'payload'

import { hasPermission, hasPermissionFilter, publicOrInstitution } from '@/access/hasPermission'
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

export const Events: CollectionConfig = {
  slug: 'events',
  access: {
    create: hasPermission('event:create'),
    delete: hasPermission('event:delete'),
    read: publicOrInstitution(),
    update: hasPermissionFilter('event:edit_own_club', 'organizingClubs'),
  },
  admin: {
    defaultColumns: ['title', 'dataSource', 'eventType', 'department', 'updatedAt'],
    useAsTitle: 'title',
    description: '📅 Events from Conosco API or manually created. CMS adds SEO, images, and editorial content.',
  },
  fields: [
    institutionField,
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    // -----------------------------------------------------------------------
    // Club Ownership & Collaboration (Phase 2)
    // -----------------------------------------------------------------------
    {
      name: 'organizingClubs',
      type: 'relationship',
      relationTo: 'clubs',
      hasMany: true,
      admin: {
        description: 'All clubs organizing this event. Supports collaborative events (e.g., IEEE + Coding Club hackathon).',
      },
    },
    {
      name: 'createdByClub',
      type: 'relationship',
      relationTo: 'clubs',
      admin: {
        description: 'The primary club that created this event. Only this club\'s admin (or superadmin) can edit.',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Event Details',
          fields: [
            {
              name: 'heroImage',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Custom hero image (overrides Conosco poster for display)',
              },
            },
            {
              name: 'editorialDescription',
              type: 'richText',
              admin: {
                description: 'Additional editorial content. Conosco description is shown separately.',
              },
            },
            {
              name: 'eventType',
              type: 'select',
              options: [
                { label: 'Workshop', value: 'workshop' },
                { label: 'Seminar', value: 'seminar' },
                { label: 'Hackathon', value: 'hackathon' },
                { label: 'Competition', value: 'competition' },
                { label: 'Cultural', value: 'cultural' },
                { label: 'Sports', value: 'sports' },
                { label: 'Guest Lecture', value: 'guest-lecture' },
                { label: 'Conference', value: 'conference' },
                { label: 'Webinar', value: 'webinar' },
                { label: 'Other', value: 'other' },
              ],
              admin: {
                description: 'For manual events. Conosco events get this from API.',
              },
            },
            {
              name: 'department',
              type: 'select',
              options: getDepartmentOptions(),
              admin: {
                position: 'sidebar',
                description: 'Organizing department',
              },
            },
            // Manual event fields (only for dataSource: 'manual')
            {
              name: 'startDate',
              type: 'date',
              admin: {
                date: { pickerAppearance: 'dayAndTime' },
                condition: (data) => data?.dataSource === 'manual',
                description: 'Only for manual events. Conosco events get dates from API.',
              },
            },
            {
              name: 'endDate',
              type: 'date',
              admin: {
                date: { pickerAppearance: 'dayAndTime' },
                condition: (data) => data?.dataSource === 'manual',
              },
            },
            {
              name: 'venue',
              type: 'text',
              admin: {
                condition: (data) => data?.dataSource === 'manual',
                description: 'Venue name for manual events',
              },
            },
            {
              name: 'manualStatus',
              type: 'select',
              options: [
                { label: 'Upcoming', value: 'upcoming' },
                { label: 'Ongoing', value: 'ongoing' },
                { label: 'Completed', value: 'completed' },
                { label: 'Cancelled', value: 'cancelled' },
              ],
              admin: {
                condition: (data) => data?.dataSource === 'manual',
                description: 'Status for manual events. Conosco events get status from API.',
              },
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
                { label: 'Simple CMS Event', value: 'manual' },
                { label: 'Conosco Managed (Full Power)', value: 'conosco' },
                { label: 'External Platform', value: 'external' },
              ],
              admin: {
                description: 'Where this event originates. Manual = CMS-only. Conosco = synced from ERP. External = IEEE vTools, Unstop, etc.',
              },
            },
            {
              name: 'registrationUrl',
              type: 'text',
              admin: {
                description: 'External registration link (Google Form, Unstop, vTools, etc.)',
                condition: (data) => data?.dataSource !== 'conosco',
              },
            },
            {
              name: 'externalPlatform',
              type: 'select',
              options: [
                { label: 'IEEE vTools', value: 'ieee-vtools' },
                { label: 'Unstop', value: 'unstop' },
                { label: 'Eventbrite', value: 'eventbrite' },
                { label: 'Devfolio', value: 'devfolio' },
                { label: 'Google Forms', value: 'google-forms' },
                { label: 'Other', value: 'other' },
              ],
              admin: {
                condition: (data) => data?.dataSource === 'external',
                description: 'Which platform manages this event',
              },
            },
            {
              name: 'externalEventUrl',
              type: 'text',
              admin: {
                condition: (data) => data?.dataSource === 'external',
                description: 'Canonical URL on the external platform',
              },
            },
            {
              name: 'conoscoEventCode',
              type: 'text',
              unique: true,
              index: true,
              admin: {
                condition: (data) => data?.dataSource === 'conosco',
                description: 'Semantic event code from Conosco (e.g., EVT-2025-0042). Used to link CMS record to API data.',
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
        description: 'Feature this event prominently on the events page',
      },
    },
    {
      name: 'relatedPosts',
      type: 'relationship',
      relationTo: 'posts',
      hasMany: true,
      admin: {
        position: 'sidebar',
        description: 'Blog posts related to this event',
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
