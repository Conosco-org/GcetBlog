import type { Block } from 'payload'
import { linkGroup } from '@/fields/linkGroup'

export const CountdownBlock: Block = {
  slug: 'countdown',
  interfaceName: 'CountdownBlockType',
  labels: {
    singular: 'Countdown',
    plural: 'Countdowns',
  },
  fields: [
    {
      name: 'eventTitle',
      type: 'text',
      required: true,
      admin: { description: 'The name of the event being counted down to' },
    },
    {
      name: 'targetDate',
      type: 'date',
      required: true,
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
        description: 'Date & time the event starts',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: { description: 'Optional short description shown below the title' },
    },
    linkGroup({ overrides: { maxRows: 1 } }),
  ],
}
