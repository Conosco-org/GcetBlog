import type { Block } from 'payload'

export const ScheduleBlock: Block = {
  slug: 'schedule',
  interfaceName: 'ScheduleBlockType',
  labels: {
    singular: 'Schedule Block',
    plural: 'Schedule Blocks',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      defaultValue: 'Event Schedule',
    },
    {
      name: 'days',
      type: 'array',
      minRows: 1,
      maxRows: 7,
      fields: [
        {
          name: 'date',
          type: 'date',
          required: true,
          admin: { date: { pickerAppearance: 'dayOnly' } },
        },
        {
          name: 'title',
          type: 'text',
          admin: { description: 'e.g. "Day 1 — Opening Ceremony"' },
        },
        {
          name: 'sessions',
          type: 'array',
          minRows: 1,
          maxRows: 20,
          fields: [
            { name: 'time', type: 'text', required: true, admin: { description: 'e.g. "10:00 AM – 11:30 AM"' } },
            { name: 'title', type: 'text', required: true },
            { name: 'speaker', type: 'text' },
            { name: 'venue', type: 'text' },
            {
              name: 'type',
              type: 'select',
              options: [
                { label: 'Talk', value: 'talk' },
                { label: 'Workshop', value: 'workshop' },
                { label: 'Panel', value: 'panel' },
                { label: 'Break', value: 'break' },
                { label: 'Networking', value: 'networking' },
              ],
              defaultValue: 'talk',
            },
          ],
        },
      ],
    },
  ],
}
