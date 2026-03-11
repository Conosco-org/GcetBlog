import type { Block } from 'payload'

export const EventsFeedBlock: Block = {
  slug: 'eventsFeed',
  interfaceName: 'EventsFeedBlockType',
  labels: {
    singular: 'Events Feed',
    plural: 'Events Feeds',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      defaultValue: 'Upcoming Events',
    },
    {
      name: 'club',
      type: 'relationship',
      relationTo: 'clubs',
      admin: {
        description: 'Show events for a specific club. Leave empty for all events.',
      },
    },
    {
      name: 'limit',
      type: 'number',
      defaultValue: 6,
      min: 1,
      max: 20,
    },
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'cards',
      options: [
        { label: 'Cards Grid', value: 'cards' },
        { label: 'Timeline', value: 'timeline' },
      ],
    },
    {
      name: 'showStatus',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Show event status badge (upcoming, ongoing, completed)' },
    },
  ],
}
