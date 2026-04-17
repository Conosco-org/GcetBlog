import React from 'react'
import { YouTubeEmbedComponent } from './youtube-embed.client'

export type YouTubeEmbedBlockProps = {
  videoUrl: string
  caption?: string | null
  blockType: 'youtubeEmbed'
}

type Props = YouTubeEmbedBlockProps & {
  className?: string
}

export const YouTubeEmbedBlock: React.FC<Props> = ({ className, videoUrl, caption }) => {
  return (
    <div className={[className, 'not-prose my-8'].filter(Boolean).join(' ')}>
      <YouTubeEmbedComponent videoUrl={videoUrl} caption={caption} />
    </div>
  )
}
