import type { Block } from 'payload'

export const TeamGridBlock: Block = {
  slug: 'teamGrid',
  interfaceName: 'TeamGridBlockType',
  labels: {
    singular: 'Team Grid',
    plural: 'Team Grids',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      defaultValue: 'Our Team',
    },
    {
      name: 'source',
      type: 'select',
      defaultValue: 'manual',
      options: [
        { label: 'Manual Entry', value: 'manual' },
        { label: 'From Conosco (auto)', value: 'conosco' },
      ],
      admin: { description: 'Manual: define members below. Conosco: auto-loaded from club data.' },
    },
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'grid',
      options: [
        { label: 'Grid', value: 'grid' },
        { label: 'Compact List', value: 'compact' },
      ],
    },
    {
      name: 'members',
      type: 'array',
      admin: {
        condition: (_, siblingData) => siblingData?.source !== 'conosco',
        description: 'Add team members manually',
      },
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'role', type: 'text', required: true },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
        },
        { name: 'email', type: 'email' },
        {
          name: 'linkedIn',
          type: 'text',
          admin: { description: 'LinkedIn profile URL' },
        },
      ],
    },
  ],
}
