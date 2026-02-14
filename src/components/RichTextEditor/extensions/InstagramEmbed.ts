import { Node, mergeAttributes } from '@tiptap/core'

export interface InstagramEmbedOptions {
  HTMLAttributes: Record<string, unknown>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    instagramEmbed: {
      /**
       * Insert an Instagram embed
       */
      setInstagramEmbed: (options: { src: string }) => ReturnType
    }
  }
}

function getInstagramPostId(url: string): string | null {
  const pattern = /instagram\.com\/p\/([A-Za-z0-9_-]+)/
  const match = url.match(pattern)
  return match ? match[1] : null
}

export const InstagramEmbed = Node.create<InstagramEmbedOptions>({
  name: 'instagramEmbed',

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
        tag: 'div[data-instagram-embed]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const postId = getInstagramPostId(HTMLAttributes.src || '')
    
    if (!postId) {
      return [
        'div',
        mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
          'data-instagram-embed': '',
          class: 'instagram-embed-error',
        }),
        [
          'div',
          { class: 'rounded-lg border border-red-500 bg-red-50 p-4 text-center my-4' },
          [
            'p',
            { class: 'text-sm text-red-600 font-medium' },
            'Invalid Instagram URL. Please use format: https://www.instagram.com/p/POST_ID/',
          ],
        ],
      ]
    }

    const postUrl = HTMLAttributes.src

    // Simpler rendering - just a placeholder div that Instagram's script will replace
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, {
        'data-instagram-embed': '',
        'data-instagram-url': postUrl,
        class: 'instagram-embed-container my-8',
        style: 'min-height: 500px; display: flex; align-items: center; justify-content: center; border: 2px dashed #ccc; border-radius: 8px; padding: 20px;',
      }),
      [
        'div',
        { class: 'text-center' },
        [
          'p',
          { class: 'text-sm text-gray-600 mb-2' },
          '📸 Instagram Post',
        ],
        [
          'p',
          { class: 'text-xs text-gray-400 break-all px-4' },
          postUrl,
        ],
        [
          'p',
          { class: 'text-xs text-gray-500 mt-2' },
          '(Preview will show after publishing)',
        ],
      ],
    ]
  },

  addCommands() {
    return {
      setInstagramEmbed:
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
