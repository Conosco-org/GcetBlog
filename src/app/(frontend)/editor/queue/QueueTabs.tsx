'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Card } from '@/frontend/components/ui/card'
import { QueueTableClient } from './QueueTableClient'
import { CommentModerationView } from './CommentModerationView'
import type { Post, Comment } from '@/shared/types/payload-types'

interface QueueTabsProps {
  activeTab: string
  pendingPostsCount: number
  pendingCommentsCount: number
  posts: {
    docs: Post[]
    totalDocs: number
    totalPages: number
    page?: number
    limit?: number
    hasPrevPage?: boolean
    hasNextPage?: boolean
  }
  pendingComments: {
    docs: Comment[]
    totalDocs: number
    totalPages: number
    page?: number
    limit?: number
    hasPrevPage?: boolean
    hasNextPage?: boolean
  }
  query: string
}

export function QueueTabs({
  activeTab,
  pendingPostsCount,
  pendingCommentsCount,
  posts,
  pendingComments,
  query,
}: QueueTabsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleTabChange = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tab)
    // Reset to page 1 when switching tabs
    params.set('page', '1')
    router.push(`/editor/queue?${params.toString()}`)
  }

  return (
    <>
      {/* Tabs Navigation */}
      <Card className="mb-6">
        <div className="border-b">
          <nav className="flex">
            <button
              onClick={() => handleTabChange('posts')}
              className={`px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'posts'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground hover:border-b-2 hover:border-muted-foreground'
              }`}
            >
              Post Approvals ({pendingPostsCount})
            </button>
            <button
              onClick={() => handleTabChange('comments')}
              className={`px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'comments'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground hover:border-b-2 hover:border-muted-foreground'
              }`}
            >
              Comment Moderation ({pendingCommentsCount})
            </button>
            <button
              className="px-6 py-4 text-sm font-medium text-muted-foreground/50 cursor-not-allowed"
              disabled
              title="Coming soon"
            >
              Publishing Schedule (0)
            </button>
          </nav>
        </div>
      </Card>

      {/* Tab Content */}
      {activeTab === 'posts' && (
        <QueueTableClient
          posts={posts}
          query={query}
        />
      )}

      {activeTab === 'comments' && (
        <CommentModerationView
          pendingComments={pendingComments}
        />
      )}
    </>
  )
}
