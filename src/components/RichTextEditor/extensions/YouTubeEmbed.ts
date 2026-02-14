import { Node, mergeAttributes } from '@tiptap/core'

export interface YouTubeEmbedOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    youtubeEmbed: {
      /**
       * Insert a YouTube embed
       */
      setYouTubeEmbed: (options: { src: string }) => ReturnType
    }
  }
}

function getYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }

  return null
}

export const YouTubeEmbed = Node.create<YouTubeEmbedOptions>({
  name: 'youtubeEmbed',

  group: 'block',

  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      src: {
        default: null,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-youtube-embed]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const videoId = getYouTubeVideoId(HTMLAttributes.src || '')
    
    if (!videoId) {
      return [
        'div',
        mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
          'data-youtube-embed': '',
          class: 'youtube-embed-error',
        }),
        [
          'div',
          { class: 'rounded-lg border border-red-500 bg-red-50 p-4 text-center my-4' },
          [
            'p',
            { class: 'text-sm text-red-600 font-medium' },
            'Invalid YouTube URL. Please use format: https://www.youtube.com/watch?v=VIDEO_ID',
          ],
        ],
      ]
    }

    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-youtube-embed': '',
        'data-youtube-id': videoId,
        class: 'youtube-embed my-8',
      }),
      [
        'div',
        { class: 'relative aspect-video w-full overflow-hidden rounded-lg border bg-card' },
        [
          'iframe',
          {
            src: `https://www.youtube-nocookie.com/embed/${videoId}`,
            frameborder: '0',
            allow:
              'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
            allowfullscreen: 'true',
            class: 'absolute inset-0 h-full w-full',
          },
        ],
      ],
    ]
  },

  addCommands() {
    return {
      setYouTubeEmbed:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          })
        },
    }
  },
})
