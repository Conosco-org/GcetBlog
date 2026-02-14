'use client'

import React from 'react'
import { VoteButtons } from '@/components/VoteButtons'
import { ShareButtons } from '@/components/ShareButtons'

interface PostEngagementProps {
  postId: string
  postSlug: string
  postTitle: string
  postDescription: string
}

export function PostEngagement({ postId, postSlug, postTitle, postDescription }: PostEngagementProps) {
  const fullUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/posts/${postSlug}`
    : `/posts/${postSlug}`

  return (
    <div className="max-w-[48rem] mx-auto my-8 p-6 rounded-2xl border border-border bg-card">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium mb-2">Did you find this helpful?</p>
          <VoteButtons postId={postId} />
        </div>
        <div>
          <p className="text-sm font-medium mb-2">Share this post</p>
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
