import type { CollectionConfig } from 'payload'

import { hasPermission, publicOrInstitution } from '../../access/hasPermission'
import { institutionField } from '../../fields/institution'
import { withTenantIsolation } from '@/hooks/tenantIsolation'
import { Archive } from '../../blocks/ArchiveBlock/config'
import { CallToAction } from '../../blocks/CallToAction/config'
import { Content } from '../../blocks/Content/config'
import { FormBlock } from '../../blocks/Form/config'
import { MediaBlock } from '../../blocks/MediaBlock/config'
import { StatsBlock } from '../../blocks/StatsBlock/config'
import { EventsFeedBlock } from '../../blocks/EventsFeed/config'
import { TeamGridBlock } from '../../blocks/TeamGrid/config'
import { CountdownBlock } from '../../blocks/Countdown/config'
import { GalleryPreviewBlock } from '../../blocks/GalleryPreview/config'
import { SponsorsBlock } from '../../blocks/Sponsors/config'
import { TestimonialsBlock } from '../../blocks/Testimonials/config'
import { ScheduleBlock } from '../../blocks/Schedule/config'
import { ContactBlock } from '../../blocks/Contact/config'
import { hero } from '@/heros/config'
import { slugField } from '@/fields/slug'
import { populatePublishedAt } from '../../hooks/populatePublishedAt'
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
    create: hasPermission('blog:publish'),
    delete: hasPermission('blog:delete'),
    read: publicOrInstitution(),
    update: hasPermission('blog:publish'),
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
          fields: [hero],
          label: 'Hero',
        },
        {
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              blocks: [
                CallToAction,
                Content,
                MediaBlock,
                Archive,
                FormBlock,
                StatsBlock,
                EventsFeedBlock,
                TeamGridBlock,
                CountdownBlock,
                GalleryPreviewBlock,
                SponsorsBlock,
                TestimonialsBlock,
                ScheduleBlock,
                ContactBlock,
              ],
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
    {
      name: 'club',
      type: 'relationship',
      relationTo: 'clubs',
      admin: {
        position: 'sidebar',
        description:
          'If set, this page becomes the club landing page at /clubs/[slug]. The page blocks and hero will render as the club\'s custom landing page.',
      },
    },
    ...slugField(),
  ],
  hooks: withTenantIsolation({
    afterChange: [revalidatePage],
    beforeChange: [populatePublishedAt],
    afterDelete: [revalidateDelete],
  }),
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
