import React from 'react'
import { InstagramEmbedComponent } from './instagram-embed.client'

export type InstagramEmbedBlockProps = {
  postUrl: string
  caption?: string | null
  blockType: 'instagramEmbed'
}

type Props = InstagramEmbedBlockProps & {
  className?: string
}

export const InstagramEmbedBlock: React.FC<Props> = ({ className, postUrl, caption }) => {
  return (
    <div className={[className, 'not-prose my-8'].filter(Boolean).join(' ')}>
      <InstagramEmbedComponent postUrl={postUrl} caption={caption} />
    </div>
  )
}
