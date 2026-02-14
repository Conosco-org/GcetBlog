import type { Block } from 'payload'

export const YouTubeEmbed: Block = {
  slug: 'youtubeEmbed',
  interfaceName: 'YouTubeEmbedBlock',
  labels: {
    singular: 'YouTube Video',
    plural: 'YouTube Videos',
  },
  fields: [
    {
      name: 'videoUrl',
      type: 'text',
      label: 'YouTube Video URL',
      required: true,
      admin: {
        description: 'Paste the full YouTube URL (e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ)',
        placeholder: 'https://www.youtube.com/watch?v=...',
      },
    },
    {
      name: 'caption',
      type: 'text',
      label: 'Caption (optional)',
      admin: {
        description: 'Add a caption to describe the video',
      },
    },
  ],
}
