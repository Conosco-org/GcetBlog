import { Node, mergeAttributes } from '@tiptap/core'

export interface InstagramEmbedOptions {
  HTMLAttributes: Record<string, any>
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
          { class: 'rounded-lg border border-destructive bg-destructive/10 p-4 text-center' },
          [
            'p',
            { class: 'text-sm text-destructive' },
            'Invalid Instagram URL',
          ],
        ],
      ]
    }

    const postUrl = HTMLAttributes.src

    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-instagram-embed': '',
        class: 'instagram-embed my-8 mx-auto max-w-xl',
      }),
      [
        'blockquote',
        {
          class: 'instagram-media',
          'data-instgrm-permalink': postUrl,
          'data-instgrm-version': '14',
          style: 'background:#FFF; border:0; border-radius:8px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin:1px; max-width:540px; min-width:326px; padding:0; width:calc(100% - 2px);',
        },
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
