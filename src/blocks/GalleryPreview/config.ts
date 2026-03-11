import type { Block } from 'payload'

export const GalleryPreviewBlock: Block = {
  slug: 'galleryPreview',
  interfaceName: 'GalleryPreviewBlockType',
  labels: {
    singular: 'Gallery Preview',
    plural: 'Gallery Previews',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      defaultValue: 'Gallery',
    },
    {
      name: 'images',
      type: 'array',
      minRows: 1,
      maxRows: 12,
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'caption',
          type: 'text',
        },
      ],
    },
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'grid',
      options: [
        { label: 'Grid', value: 'grid' },
        { label: 'Masonry', value: 'masonry' },
      ],
    },
    {
      name: 'limit',
      type: 'number',
      defaultValue: 6,
      min: 3,
      max: 12,
      admin: { description: 'Number of images to show in the preview' },
    },
  ],
}
