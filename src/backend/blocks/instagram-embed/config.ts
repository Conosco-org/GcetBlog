import type { Block } from 'payload'

export const InstagramEmbed: Block = {
  slug: 'instagramEmbed',
  interfaceName: 'InstagramEmbedBlock',
  labels: {
    singular: 'Instagram Post',
    plural: 'Instagram Posts',
  },
  fields: [
    {
      name: 'postUrl',
      type: 'text',
      label: 'Instagram Post URL',
      required: true,
      admin: {
        description: 'Paste the full Instagram post URL (e.g., https://www.instagram.com/p/ABC123/)',
        placeholder: 'https://www.instagram.com/p/...',
      },
    },
    {
      name: 'caption',
      type: 'text',
      label: 'Caption (optional)',
      admin: {
        description: 'Add a caption to describe the post',
      },
    },
  ],
}
