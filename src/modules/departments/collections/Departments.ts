/**
 * Departments Collection — CMS Content for Academic Departments
 *
 * Each institution's academic departments as first-class content entities.
 * Departments can have their own landing page, blog posts, events, and clubs.
 *
 * Doctrine: Unlike clubs (which may sync from Conosco), departments are
 * managed entirely in this CMS. They are used for:
 *   - Public department landing pages (/departments/[slug])
 *   - Filtering content by department across the platform
 *   - Department-scoped domains (cse.gcet.edu.in → CSE content only)
 */

import type { CollectionConfig } from 'payload'

import { hasPermission, publicOrInstitution } from '@/access/hasPermission'
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

export const Departments: CollectionConfig = {
  slug: 'departments',
  access: {
    create: hasPermission('club:edit_page'), // institution_admin bypasses; club:edit_page for club_admins
    delete: hasPermission('club:edit_page'),
    read: publicOrInstitution(),
    update: hasPermission('club:edit_page'),
  },
  admin: {
    defaultColumns: ['title', 'code', 'category', 'featured', 'updatedAt'],
    useAsTitle: 'title',
    group: 'Content',
    description: '🏫 Academic departments of the institution. Each can have its own landing page, posts, events, and clubs.',
  },
  fields: [
    institutionField,
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: { description: 'Full department name (e.g., "Computer Science & Engineering")' },
    },
    {
      name: 'code',
      type: 'select',
      required: true,
      options: getDepartmentOptions(),
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Department code — must match Conosco department codes for integration',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Department Details',
          fields: [
            {
              name: 'shortDescription',
              type: 'textarea',
              admin: {
                description: 'Brief one-line description shown on listing cards',
              },
            },
            {
              name: 'editorialDescription',
              type: 'richText',
              admin: {
                description: 'Rich editorial content about the department — programs, achievements, vision.',
              },
            },
            {
              name: 'category',
              type: 'select',
              options: [
                { label: 'Engineering', value: 'engineering' },
                { label: 'Science', value: 'science' },
                { label: 'Arts & Humanities', value: 'arts' },
                { label: 'Commerce', value: 'commerce' },
                { label: 'Management', value: 'management' },
                { label: 'Other', value: 'other' },
              ],
              defaultValue: 'engineering',
              admin: { description: 'Academic category of this department' },
            },
            {
              name: 'heroImage',
              type: 'upload',
              relationTo: 'media',
              admin: { description: 'Department banner/hero image' },
            },
            {
              name: 'logo',
              type: 'upload',
              relationTo: 'media',
              admin: { description: 'Department logo (used in cards)' },
            },
          ],
        },
        {
          label: 'Staff & Stats',
          fields: [
            {
              name: 'hod',
              type: 'group',
              admin: { description: 'Head of Department details' },
              fields: [
                {
                  name: 'name',
                  type: 'text',
                  admin: { description: 'HOD full name' },
                },
                {
                  name: 'email',
                  type: 'email',
                  admin: { description: 'HOD contact email' },
                },
                {
                  name: 'designation',
                  type: 'text',
                  defaultValue: 'Professor & Head',
                  admin: { description: 'Official designation' },
                },
                {
                  name: 'photo',
                  type: 'upload',
                  relationTo: 'media',
                  admin: { description: 'HOD profile photo' },
                },
              ],
            },
            {
              name: 'facultyCount',
              type: 'number',
              admin: {
                description: 'Number of faculty members',
                step: 1,
              },
            },
            {
              name: 'studentCount',
              type: 'number',
              admin: {
                description: 'Approximate number of students',
                step: 1,
              },
            },
            {
              name: 'yearEstablished',
              type: 'number',
              admin: {
                description: 'Year the department was established',
                step: 1,
              },
            },
            {
              name: 'socialLinks',
              type: 'group',
              admin: { description: 'Social media and web presence for this department' },
              fields: [
                { name: 'website', type: 'text', admin: { description: 'Department website URL' } },
                { name: 'instagram', type: 'text', admin: { description: 'Instagram profile URL' } },
                { name: 'linkedin', type: 'text', admin: { description: 'LinkedIn page URL' } },
              ],
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
          description: 'Visual customization for this department\'s landing page',
          fields: [
            {
              name: 'theme',
              type: 'group',
              admin: {
                description: 'Per-department color theme applied on the department landing page.',
              },
              fields: [
                {
                  name: 'primaryColor',
                  type: 'text',
                  defaultValue: '#0047AB',
                  admin: { description: 'Primary brand color (hex, e.g. #1a5276)' },
                },
                {
                  name: 'accentColor',
                  type: 'text',
                  admin: { description: 'Secondary accent color (hex)' },
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
        description: 'Feature this department prominently on the departments page',
      },
    },
    {
      name: 'relatedPosts',
      type: 'relationship',
      relationTo: 'posts',
      hasMany: true,
      admin: {
        position: 'sidebar',
        description: 'Blog posts related to this department',
      },
    },
    {
      name: 'relatedClubs',
      type: 'relationship',
      relationTo: 'clubs',
      hasMany: true,
      admin: {
        position: 'sidebar',
        description: 'Student clubs affiliated with this department',
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
