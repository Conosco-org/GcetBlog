'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import ContentManagerClient from './ContentManagerClient'
import { ContentManagerComments } from './ContentManagerComments'
import type { Comment, Post, Category } from '@/payload-types'

interface ContentManagerTabsProps {
  activeTab: string
  posts: {
    docs: Post[]
    totalDocs: number
    totalPages: number
    page?: number
    hasPrevPage?: boolean
    hasNextPage?: boolean
  }
  categories: {
    docs: Category[]
    totalDocs: number
    totalPages: number
    page?: number
    hasPrevPage?: boolean
    hasNextPage?: boolean
  }
  comments: Comment[]
}

export function ContentManagerTabs({
  activeTab,
  posts,
  categories,
  comments,
}: ContentManagerTabsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleTabChange = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tab)
    router.push(`/editor/content?${params.toString()}`)
  }

  return (
    <>
      {/* Tabs Navigation */}
      <Card className="mb-6">
        <div className="border-b">
          <nav className="flex items-center justify-between">
            <div className="flex">
              <button
                onClick={() => handleTabChange('posts')}
                className={`px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'posts'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground hover:border-b-2 hover:border-muted-foreground'
                }`}
              >
                Posts ({posts.totalDocs})
              </button>
              <button
                onClick={() => handleTabChange('comments')}
                className={`px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'comments'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground hover:border-b-2 hover:border-muted-foreground'
                }`}
              >
                Comments ({comments.length})
              </button>
            </div>
            {activeTab === 'posts' && (
              <div className="px-6">
                <Link href="/editor/posts/create">
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    New Post
                  </Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </Card>

      {/* Tab Content */}
      {activeTab === 'posts' && (
        <ContentManagerClient posts={posts} categories={categories} />
      )}

      {activeTab === 'comments' && (
        <ContentManagerComments comments={comments} />
      )}
    </>
  )
}
