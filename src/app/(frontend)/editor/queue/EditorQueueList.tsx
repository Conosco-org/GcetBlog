'use client'

import { useState } from 'react'
import Link from 'next/link'
import { approvePost, requestChanges } from './actions'
import { Button } from '@frontend/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/frontend/components/ui/card'
import { Textarea } from '@/frontend/components/ui/textarea'
import { Badge } from '@/frontend/components/ui/badge'
import { Eye } from 'lucide-react'
import type { Post } from '@/shared/types/payload-types'

interface EditorQueueListProps {
  posts: Post[]
}

export function EditorQueueList({ posts }: EditorQueueListProps) {
  const [processingIds, setProcessingIds] = useState<string[]>([])
  const [feedback, setFeedback] = useState<{ [key: string]: string }>({})
  const [messages, setMessages] = useState<{
    [key: string]: { type: 'success' | 'error'; text: string }
  }>({})

  async function handleApprove(postId: string) {
    setProcessingIds((prev) => [...prev, postId])

    try {
      const result = await approvePost(postId, feedback[postId] || '')

      if (result.success) {
        setMessages((prev) => ({ ...prev, [postId]: { type: 'success', text: result.message } }))
        setTimeout(() => window.location.reload(), 1500)
      } else {
        setMessages((prev) => ({ ...prev, [postId]: { type: 'error', text: result.message } }))
      }
    } catch {
      setMessages((prev) => ({ ...prev, [postId]: { type: 'error', text: 'An error occurred' } }))
    } finally {
      setProcessingIds((prev) => prev.filter((id) => id !== postId))
    }
  }

  async function handleRequestChanges(postId: string) {
    if (!feedback[postId]) {
      setMessages((prev) => ({
        ...prev,
        [postId]: { type: 'error', text: 'Please provide feedback for requesting changes' },
      }))
      return
    }

    setProcessingIds((prev) => [...prev, postId])

    try {
      const result = await requestChanges(postId, feedback[postId])

      if (result.success) {
        setMessages((prev) => ({ ...prev, [postId]: { type: 'success', text: result.message } }))
        setTimeout(() => window.location.reload(), 1500)
      } else {
        setMessages((prev) => ({ ...prev, [postId]: { type: 'error', text: result.message } }))
      }
    } catch {
      setMessages((prev) => ({ ...prev, [postId]: { type: 'error', text: 'An error occurred' } }))
    } finally {
      setProcessingIds((prev) => prev.filter((id) => id !== postId))
    }
  }

  if (posts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Pending Posts</CardTitle>
          <CardDescription>All posts have been reviewed. Great job!</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            When authors submit new posts for review, they will appear here.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => {
        const isProcessing = processingIds.includes(post.id)
        const message = messages[post.id]
        const authors = Array.isArray(post.populatedAuthors) ? post.populatedAuthors : []

        return (
          <Card key={post.id} className="w-full">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <CardTitle className="text-lg">
                    <Link
                      href={`/editor/posts/${post.id}/edit`}
                      className="hover:underline text-blue-600"
                    >
                      {post.title}
                    </Link>
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>
                      By {authors.map((author) => author.name).join(', ') || 'Unknown Author'}
                    </span>
                    <span>•</span>
                    <span>Last updated: {new Date(post.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <Badge variant="secondary">Draft</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Post Preview */}
              <div className="p-4 bg-gray-50 rounded-md">
                <h4 className="font-medium mb-2">Content Preview:</h4>
                <div className="text-sm text-muted-foreground">
                  {post.content
                    ? 'Rich content - view in admin panel for full preview'
                    : 'No content'}
                </div>
                {post.heroImage && (
                  <div className="mt-2">
                    <span className="text-xs text-muted-foreground">Has hero image</span>
                  </div>
                )}
              </div>

              {/* Categories */}
              {post.categories && Array.isArray(post.categories) && post.categories.length > 0 && (
                <div>
                  <span className="text-sm font-medium">Categories: </span>
                  <div className="inline-flex gap-1">
                    {post.categories.map((category, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {typeof category === 'object' && category.title
                          ? category.title
                          : 'Category'}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Previous Editor Feedback */}
              {post.editorFeedback && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <h5 className="font-medium text-red-800 mb-1">Previous Feedback:</h5>
                  <p className="text-sm text-red-700">{post.editorFeedback}</p>
                </div>
              )}

              {/* Editor Actions */}
              <div className="space-y-3 border-t pt-4">
                <div>
                  <label htmlFor={`feedback-${post.id}`} className="block text-sm font-medium mb-1">
                    Editor Notes (optional for approval, required for requesting changes):
                  </label>
                  <Textarea
                    id={`feedback-${post.id}`}
                    value={feedback[post.id] || ''}
                    onChange={(e) =>
                      setFeedback((prev) => ({ ...prev, [post.id]: e.target.value }))
                    }
                    placeholder="Add notes or feedback for the author..."
                    rows={3}
                  />
                </div>

                {message && (
                  <div
                    className={`p-3 rounded-md text-sm ${
                      message.type === 'success'
                        ? 'bg-green-50 text-green-800 border border-green-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}
                  >
                    {message.text}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleApprove(post.id)}
                    disabled={isProcessing}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isProcessing ? 'Processing...' : 'Approve & Publish'}
                  </Button>
                  <Button
                    onClick={() => handleRequestChanges(post.id)}
                    disabled={isProcessing}
                    variant="destructive"
                  >
                    {isProcessing ? 'Processing...' : 'Request Changes'}
                  </Button>
                  <Button asChild variant="outline">
                    <Link href={`/posts/${post.slug}?draft=true`} target="_blank">
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href={`/editor/posts/${post.id}/edit`}>Edit Post</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
