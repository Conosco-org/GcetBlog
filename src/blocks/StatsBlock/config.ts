import type { Block } from 'payload'

export const StatsBlock: Block = {
  slug: 'statsBlock',
  interfaceName: 'StatsBlockType',
  labels: {
    singular: 'Stats Block',
    plural: 'Stats Blocks',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      admin: { description: 'Optional heading above the stats' },
    },
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'grid',
      options: [
        { label: 'Grid', value: 'grid' },
        { label: 'Inline Strip', value: 'strip' },
      ],
    },
    {
      name: 'stats',
      type: 'array',
      minRows: 1,
      maxRows: 6,
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'value', type: 'text', required: true },
        {
          name: 'icon',
          type: 'select',
          options: [
            { label: 'Users', value: 'users' },
            { label: 'Calendar', value: 'calendar' },
            { label: 'Trophy', value: 'trophy' },
            { label: 'Star', value: 'star' },
            { label: 'Target', value: 'target' },
            { label: 'Zap', value: 'zap' },
          ],
        },
        {
          name: 'description',
          type: 'text',
          admin: { description: 'Optional helper text below the value' },
        },
      ],
    },
  ],
}
