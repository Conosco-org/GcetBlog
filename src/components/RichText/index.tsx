import { MediaBlock } from '@/blocks/MediaBlock/Component'
import React from 'react'
import {
  DefaultNodeTypes,
  SerializedBlockNode,
  SerializedLinkNode,
  type DefaultTypedEditorState,
} from '@payloadcms/richtext-lexical'
import {
  JSXConvertersFunction,
  LinkJSXConverter,
  RichText as ConvertRichText,
} from '@payloadcms/richtext-lexical/react'

import { CodeBlock, CodeBlockProps } from '@/blocks/Code/Component'
import { YouTubeEmbedBlock } from '@/blocks/YouTubeEmbed/Component'
import { InstagramEmbedBlock } from '@/blocks/InstagramEmbed/Component'

import type {
  BannerBlock as BannerBlockProps,
  CallToActionBlock as CTABlockProps,
  MediaBlock as MediaBlockProps,
  YouTubeEmbedBlock as YouTubeEmbedBlockProps,
  InstagramEmbedBlock as InstagramEmbedBlockProps,
} from '@/payload-types'
import { BannerBlock } from '@/blocks/Banner/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { cn } from '@/utilities/ui'

type NodeTypes =
  | DefaultNodeTypes
  | SerializedBlockNode<
      | CTABlockProps
      | MediaBlockProps
      | BannerBlockProps
      | CodeBlockProps
      | YouTubeEmbedBlockProps
      | InstagramEmbedBlockProps
    >

const internalDocToHref = ({ linkNode }: { linkNode: SerializedLinkNode }) => {
  const { value, relationTo } = linkNode.fields.doc!
  if (typeof value !== 'object') {
    throw new Error('Expected value to be an object')
  }
  const slug = value.slug
  return relationTo === 'posts' ? `/posts/${slug}` : `/${slug}`
}

// ── helpers ───────────────────────────────────────────────────────────────────

function extractEmbedFromParagraph(
  node: { children?: Array<{ type: string; text?: string }> },
): React.ReactNode | null {
  const children = node.children ?? []
  if (children.length !== 1 || children[0].type !== 'text') return null
  const text = children[0].text ?? ''

  // YouTube shortcode: [YouTube: url]
  const youtubeMatch = text.match(/^\[YouTube:\s*(https?:\/\/[^\]]+)\]$/)
  if (youtubeMatch) {
    const url = youtubeMatch[1].trim()
    const videoId =
      url.match(/[?&]v=([^&]+)/)?.[1] ||
      url.match(/youtu\.be\/([^?#]+)/)?.[1] ||
      url.match(/youtube\.com\/embed\/([^?]+)/)?.[1]
    if (videoId) {
      return (
        <div className="my-8 col-start-2">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-card">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${videoId}`}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          </div>
        </div>
      )
    }
  }

  // Instagram shortcode: [Instagram: url]
  const instagramMatch = text.match(/^\[Instagram:\s*(https?:\/\/[^\]]+)\]$/)
  if (instagramMatch) {
    const postUrl = instagramMatch[1].trim()
    if (postUrl.includes('instagram.com')) {
      return (
        <div className="my-8 flex justify-center col-start-2">
          <blockquote
            className="instagram-media"
            data-instgrm-permalink={postUrl}
            data-instgrm-version="14"
            style={{
              background: '#FFF',
              border: '0',
              borderRadius: '8px',
              boxShadow: '0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)',
              margin: '1px',
              maxWidth: '540px',
              minWidth: '326px',
              padding: '0',
              width: 'calc(100% - 2px)',
            }}
          />
        </div>
      )
    }
  }

  return null
}

const jsxConverters: JSXConvertersFunction<NodeTypes> = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...LinkJSXConverter({ internalDocToHref }),
  // Inline images inserted by the Tiptap editor (uploaded to Cloudinary)
  inlineImage: ({ node }: { node: { src?: string; alt?: string } }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={node.src ?? ''}
      alt={node.alt ?? ''}
      className="rounded-lg max-w-full h-auto my-4 col-start-2"
    />
  ),
  // Override paragraph to handle YouTube/Instagram shortcodes stored as text nodes
  // in older posts. New posts use proper Payload block nodes handled by the blocks
  // converters above. This is purely a backward-compatibility fallback.
  paragraph: (props: any) => {
    const embed = extractEmbedFromParagraph(props.node)
    if (embed) return embed
    // Delegate to Payload's default paragraph converter for normal paragraphs
    const paraFn = defaultConverters.paragraph
    if (typeof paraFn === 'function') return paraFn(props)
    return null
  },
  blocks: {
    banner: ({ node }) => <BannerBlock className="col-start-2 mb-4" {...node.fields} />,
    mediaBlock: ({ node }) => (
      <MediaBlock
        className="col-start-1 col-span-3"
        imgClassName="m-0"
        {...node.fields}
        captionClassName="mx-auto max-w-[48rem]"
        enableGutter={false}
        disableInnerContainer={true}
      />
    ),
    code: ({ node }) => <CodeBlock className="col-start-2" {...node.fields} />,
    cta: ({ node }) => <CallToActionBlock {...node.fields} />,
    youtubeEmbed: ({ node }) => <YouTubeEmbedBlock className="col-start-2 my-8" {...node.fields} />,
    instagramEmbed: ({ node }) => (
      <InstagramEmbedBlock className="col-start-2 my-8" {...node.fields} />
    ),
  },
  // Text converter: only handles inline formatting (bold, italic, etc.).
  // Shortcodes are handled above in the paragraph converter.
  text: ({ node }) => {
    const text = node.text || ''
    // Format bitmask: 1=BOLD 2=ITALIC 4=STRIKETHROUGH 8=UNDERLINE 16=CODE
    const fmt: number = node.format || 0
    let rendered: React.ReactNode = text

    if (fmt & 16) rendered = <code>{rendered}</code>       // CODE (innermost)
    if (fmt & 1) rendered = <strong>{rendered}</strong>    // BOLD
    if (fmt & 2) rendered = <em>{rendered}</em>            // ITALIC
    if (fmt & 4) rendered = <s>{rendered}</s>              // STRIKETHROUGH
    if (fmt & 8) rendered = <u>{rendered}</u>              // UNDERLINE

    return <>{rendered}</>
  },
})

type Props = {
  data: DefaultTypedEditorState
  enableGutter?: boolean
  enableProse?: boolean
} & React.HTMLAttributes<HTMLDivElement>

export default function RichText(props: Props) {
  const { className, enableProse = true, enableGutter = true, ...rest } = props
  return (
    <ConvertRichText
      converters={jsxConverters}
      className={cn(
        'payload-richtext',
        {
          container: enableGutter,
          'max-w-none': !enableGutter,
          'mx-auto prose md:prose-md dark:prose-invert': enableProse,
        },
        className,
      )}
      {...rest}
    />
  )
}
