import type { Block } from 'payload'

export const SponsorsBlock: Block = {
  slug: 'sponsors',
  interfaceName: 'SponsorsBlockType',
  labels: {
    singular: 'Sponsors Block',
    plural: 'Sponsors Blocks',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      defaultValue: 'Our Partners & Sponsors',
    },
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'grid',
      options: [
        { label: 'Grid', value: 'grid' },
        { label: 'Scrolling Marquee', value: 'marquee' },
      ],
    },
    {
      name: 'sponsors',
      type: 'array',
      minRows: 1,
      maxRows: 20,
      fields: [
        { name: 'name', type: 'text', required: true },
        {
          name: 'logo',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'url',
          type: 'text',
          admin: { description: 'Link to sponsor website' },
        },
        {
          name: 'tier',
          type: 'select',
          options: [
            { label: 'Gold', value: 'gold' },
            { label: 'Silver', value: 'silver' },
            { label: 'Bronze', value: 'bronze' },
            { label: 'Partner', value: 'partner' },
          ],
          defaultValue: 'partner',
        },
      ],
    },
  ],
}
