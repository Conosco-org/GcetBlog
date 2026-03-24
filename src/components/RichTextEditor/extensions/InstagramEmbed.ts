import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react'
import React from 'react'

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

function InstagramNodeView({ node }: { node: { attrs: { src: string } } }) {
  const postId = getInstagramPostId(node.attrs.src || '')
  const postUrl = node.attrs.src

  return React.createElement(
    NodeViewWrapper,
    { className: 'instagram-embed-container my-6 not-prose', contentEditable: false },
    postId
      ? React.createElement(
          'div',
          {
            className: 'rounded-lg border-2 border-dashed border-pink-300 bg-pink-50 dark:bg-pink-950/20 dark:border-pink-800 p-6 text-center',
          },
          React.createElement('div', { className: 'text-2xl mb-2' }, 'ðŸ“¸'),
          React.createElement('p', { className: 'text-sm font-medium text-pink-700 dark:text-pink-300' }, 'Instagram Post'),
          React.createElement(
            'p',
            { className: 'text-xs text-muted-foreground mt-1 break-all' },
            postUrl,
          ),
          React.createElement(
            'p',
            { className: 'text-xs text-muted-foreground mt-2 italic' },
            'Renders on published post',
          ),
        )
      : React.createElement(
          'div',
          { className: 'rounded-lg border border-red-300 bg-red-50 p-4 text-center text-sm text-red-600' },
          'Invalid Instagram URL',
        ),
  )
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
        getAttrs: (element: HTMLElement) => ({
          src:
            element.getAttribute('data-instagram-url') ||
            element.getAttribute('src') ||
            null,
        }),
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const postId = getInstagramPostId(HTMLAttributes.src || '')
    const postUrl = HTMLAttributes.src
    if (!postId) {
      return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-instagram-embed': '' })]
    }
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, {
        'data-instagram-embed': '',
        'data-instagram-url': postUrl,
        class: 'instagram-embed-container my-8',
      }),
      ['p', { class: 'text-sm text-gray-600' }, 'ðŸ“¸ Instagram: ' + postUrl],
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(InstagramNodeView as any)
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
