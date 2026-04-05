import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper, type ReactNodeViewProps } from '@tiptap/react'
import React from 'react'

export interface YouTubeEmbedOptions {
  HTMLAttributes: Record<string, unknown>
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

function YouTubeNodeView({ node }: ReactNodeViewProps) {
  const videoId = getYouTubeVideoId((node.attrs.src as string) || '')

  return React.createElement(
    NodeViewWrapper,
    { className: 'youtube-embed my-6 not-prose', contentEditable: false },
    videoId
      ? React.createElement(
          'div',
          { className: 'relative aspect-video w-full overflow-hidden rounded-lg border bg-muted' },
          React.createElement('iframe', {
            src: `https://www.youtube-nocookie.com/embed/${videoId}`,
            title: 'YouTube video player',
            allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
            allowFullScreen: true,
            className: 'absolute inset-0 h-full w-full',
          }),
        )
      : React.createElement(
          'div',
          { className: 'rounded-lg border border-red-300 bg-red-50 p-4 text-center text-sm text-red-600' },
          'Invalid YouTube URL',
        ),
  )
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
        getAttrs: (element: HTMLElement) => {
          const src = element.getAttribute('src')
          const videoId = element.getAttribute('data-youtube-id')
          return {
            src:
              src ||
              (videoId ? `https://www.youtube.com/watch?v=${videoId}` : null),
          }
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const videoId = getYouTubeVideoId(HTMLAttributes.src || '')
    if (!videoId) {
      return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-youtube-embed': '' })]
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
            allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
            allowfullscreen: 'true',
            class: 'absolute inset-0 h-full w-full',
          },
        ],
      ],
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(YouTubeNodeView)
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
