'use client'

import React, { useState, useEffect } from 'react'
import { VoteButtons } from '@/components/post/VoteButtons'
import { ShareButtons } from '@/components/post/ShareButtons'

interface PostEngagementProps {
  postId: string
  postSlug: string
  postTitle: string
  postDescription: string
  initialLikes?: number
  initialUserVote?: 1 | -1 | null
  /** sidebar: vertical sticky on desktop left col | inline: horizontal below content on mobile | share-only: just share row */
  variant?: 'sidebar' | 'inline' | 'share-only'
}

export function PostEngagement({ postId, postSlug, postTitle, postDescription, initialLikes = 0, initialUserVote = null, variant = 'inline' }: PostEngagementProps) {
  // Start with a relative URL (same on server and client) to avoid hydration mismatch,
  // then upgrade to the absolute URL after mount.
  const [fullUrl, setFullUrl] = useState(`/posts/${postSlug}`)
  useEffect(() => {
    setFullUrl(`${window.location.origin}/posts/${postSlug}`)
  }, [postSlug])

  if (variant === 'sidebar') {
    return (
      <div className="flex flex-col items-center gap-4">
        <VoteButtons postId={postId} variant="compact" initialLikes={initialLikes} initialUserVote={initialUserVote} />
        <div className="w-px h-4 bg-border" />
        <ShareButtons
          url={fullUrl}
          title={postTitle}
          description={postDescription}
          variant="icons"
          className="flex-col"
        />
      </div>
    )
  }

  if (variant === 'share-only') {
    return (
      <div className="pt-6 border-t border-border flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">Share this article</p>
        <ShareButtons
          url={fullUrl}
          title={postTitle}
          description={postDescription}
          variant="icons"
        />
      </div>
    )
  }

  // inline (mobile): votes + share in a card
  return (
    <div className="p-5 rounded-2xl border border-border bg-card">
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Was this helpful?</p>
          <VoteButtons postId={postId} initialLikes={initialLikes} initialUserVote={initialUserVote} />
        </div>
        <div className="h-px bg-border" />
        <div>
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Share</p>
          <ShareButtons
            url={fullUrl}
            title={postTitle}
            description={postDescription}
            variant="icons"
          />
        </div>
      </div>
    </div>
  )
}
