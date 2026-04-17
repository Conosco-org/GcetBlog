'use client'

import React from 'react'

interface YouTubeEmbedComponentProps {
  videoUrl: string
  caption?: string | null
}

// Extract YouTube video ID from various URL formats
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

export const YouTubeEmbedComponent: React.FC<YouTubeEmbedComponentProps> = ({
  videoUrl,
  caption,
}) => {
  const videoId = getYouTubeVideoId(videoUrl)

  if (!videoId) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-center">
        <p className="text-sm text-destructive">Invalid YouTube URL. Please check the URL and try again.</p>
      </div>
    )
  }

  return (
    <figure className="overflow-hidden rounded-lg border bg-card">
      <div className="relative aspect-video w-full">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}`}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
      {caption && (
        <figcaption className="px-4 py-3 text-sm text-muted-foreground border-t">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
