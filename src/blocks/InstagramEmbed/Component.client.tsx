'use client'

import React, { useEffect, useRef } from 'react'

interface InstagramEmbedComponentProps {
  postUrl: string
  caption?: string | null
}

interface InstagramWindow extends Window {
  instgrm?: {
    Embeds: {
      process: () => void
    }
  }
}

// Extract Instagram post ID from URL
function getInstagramPostId(url: string): string | null {
  const pattern = /instagram\.com\/p\/([A-Za-z0-9_-]+)/
  const match = url.match(pattern)
  return match ? match[1] : null
}

export const InstagramEmbedComponent: React.FC<InstagramEmbedComponentProps> = ({
  postUrl,
  caption,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const postId = getInstagramPostId(postUrl)

  useEffect(() => {
    // Load Instagram embed script
    const script = document.createElement('script')
    script.src = 'https://www.instagram.com/embed.js'
    script.async = true
    document.body.appendChild(script)

    // Process embeds when script loads
    script.onload = () => {
      if ((window as InstagramWindow).instgrm) {
        (window as InstagramWindow).instgrm?.Embeds.process()
      }
    }

    return () => {
      // Cleanup
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [postUrl])

  if (!postId) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-center">
        <p className="text-sm text-destructive">
          Invalid Instagram URL. Please check the URL and try again.
        </p>
      </div>
    )
  }

  return (
    <figure className="mx-auto max-w-xl" ref={containerRef}>
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
      {caption && (
        <figcaption className="mt-2 text-center text-sm text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
