import { MediaBlock } from '@/blocks/MediaBlock/Component'
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

const jsxConverters: JSXConvertersFunction<NodeTypes> = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...LinkJSXConverter({ internalDocToHref }),
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
  text: ({ node }) => {
    const text = node.text || ''
    
    // Check for YouTube embed pattern: [YouTube: https://www.youtube.com/watch?v=ID]
    const youtubeMatch = text.match(/\[YouTube: ([^\]]+)\]/)
    if (youtubeMatch) {
      const videoId = youtubeMatch[1].match(/[?&]v=([^&]+)/)?.[1] || 
                      youtubeMatch[1].match(/youtu\.be\/([^?]+)/)?.[1]
      if (videoId) {
        return (
          <div className="my-8">
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

    // Check for Instagram embed pattern: [Instagram: https://www.instagram.com/p/ID/]
    const instagramMatch = text.match(/\[Instagram: ([^\]]+)\]/)
    if (instagramMatch) {
      const postUrl = instagramMatch[1]
      const postId = postUrl.match(/\/p\/([^/]+)/)?.[1]
      if (postId) {
        return (
          <div className="my-8 flex justify-center">
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

    // Default text rendering - just return the text as is
    return <>{text}</>
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
