import type { CollectionConfig } from 'payload'

import { publicOrAuthenticated } from '@backend/access/public-or-authenticated'
import { isAdminOrEditor } from '@backend/access/is-admin-or-editor'
import { Archive } from '@backend/blocks/archive-block/config'
import { CallToAction } from '@backend/blocks/call-to-action/config'
import { Content } from '@backend/blocks/content/config'
import { FormBlock } from '@backend/blocks/form/config'
import { MediaBlock } from '@backend/blocks/media-block/config'
import { hero } from '@frontend/components/heros/config'
import { slugField } from '@backend/fields/slug'
import { populatePublishedAt } from '@backend/hooks/populate-published-at'
import { revalidateDelete, revalidatePage } from './hooks/revalidatePage'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'

export const Pages: CollectionConfig<'pages'> = {
  slug: 'pages',
  access: {
    create: isAdminOrEditor,
    delete: isAdminOrEditor,
    read: publicOrAuthenticated,
    update: isAdminOrEditor,
  },
  // This config controls what's populated by default when a page is referenced
  // https://payloadcms.com/docs/queries/select#defaultpopulate-collection-config-property
  // Type safe if the collection slug generic is passed to `CollectionConfig` - `CollectionConfig<'pages'>
  defaultPopulate: {
    title: true,
    slug: true,
  },
  admin: {
    defaultColumns: ['title', 'slug', 'updatedAt'],
    useAsTitle: 'title',
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
          fields: [hero],
          label: 'Hero',
        },
        {
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              blocks: [CallToAction, Content, MediaBlock, Archive, FormBlock],
              required: true,
              admin: {
                initCollapsed: true,
              },
            },
          ],
          label: 'Content',
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
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),

            MetaDescriptionField({}),
            PreviewField({
              // if the `generateUrl` function is configured
              hasGenerateFn: true,

              // field paths to match the target field for data
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    ...slugField(),
  ],
  hooks: {
    afterChange: [revalidatePage],
    beforeChange: [populatePublishedAt],
    afterDelete: [revalidateDelete],
    beforeValidate: [
      ({ data }) => {
        // Validate meta description length
        if (data?.meta?.description && typeof data.meta.description === 'string') {
          const description = data.meta.description
          if (description.length > 160) {
            throw new Error(`Meta description must be 160 characters or less (currently ${description.length} characters)`)
          }
          // Note: We don't throw for minimum length - just a warning
          if (description.length < 120) {
            // SEO warning - not critical
          }
        }
        return data
      },
    ],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100, // We set this interval for optimal live preview
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
