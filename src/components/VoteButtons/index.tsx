'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface VoteButtonsProps {
  postId: string
  className?: string
  variant?: 'compact' | 'full'
}

interface VoteData {
  score: number
  upvotes: number
  downvotes: number
  userVote: number | null
}

export function VoteButtons({ postId, className, variant = 'full' }: VoteButtonsProps) {
  const [data, setData] = useState<VoteData>({ score: 0, upvotes: 0, downvotes: 0, userVote: null })
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Fetch current vote data
  const fetchVotes = useCallback(async () => {
    try {
      const res = await fetch(`/api/votes?postId=${postId}`)
      if (res.ok) {
        const result = await res.json()
        setData(result)
      }
    } catch {
      // Silently fail
    } finally {
      setIsInitialized(true)
    }
  }, [postId])

  useEffect(() => {
    fetchVotes()
  }, [fetchVotes])

  const handleVote = async (value: 1 | -1) => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, value }),
      })

      if (res.ok) {
        const result = await res.json()
        setData({
          score: result.score,
          upvotes: result.upvotes,
          downvotes: result.downvotes,
          userVote: result.userVote,
        })
      } else if (res.status === 401) {
        // Redirect to login
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}&message=Sign in to vote`
      }
    } catch {
      // Silently fail
    } finally {
      setIsLoading(false)
    }
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-1 ${className || ''}`}>
        <button
          onClick={() => handleVote(1)}
          disabled={isLoading}
          className={`p-1 rounded transition-colors ${
            data.userVote === 1
              ? 'text-green-600 dark:text-green-400'
              : 'text-muted-foreground hover:text-green-600'
          }`}
          aria-label="Upvote"
        >
          <ThumbsUp className="h-3.5 w-3.5" fill={data.userVote === 1 ? 'currentColor' : 'none'} />
        </button>
        <span className={`text-xs font-medium min-w-[1.5rem] text-center ${
          data.score > 0 ? 'text-green-600 dark:text-green-400' :
          data.score < 0 ? 'text-red-600 dark:text-red-400' :
          'text-muted-foreground'
        }`}>
          {isInitialized ? data.score : '—'}
        </span>
        <button
          onClick={() => handleVote(-1)}
          disabled={isLoading}
          className={`p-1 rounded transition-colors ${
            data.userVote === -1
              ? 'text-red-600 dark:text-red-400'
              : 'text-muted-foreground hover:text-red-600'
          }`}
          aria-label="Downvote"
        >
          <ThumbsDown className="h-3.5 w-3.5" fill={data.userVote === -1 ? 'currentColor' : 'none'} />
        </button>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      <Button
        variant={data.userVote === 1 ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleVote(1)}
        disabled={isLoading}
        className={`gap-1.5 ${
          data.userVote === 1
            ? 'bg-green-600 hover:bg-green-700 text-white border-green-600'
            : 'hover:border-green-600 hover:text-green-600'
        }`}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ThumbsUp className="h-4 w-4" fill={data.userVote === 1 ? 'currentColor' : 'none'} />
        )}
        <span>{data.upvotes}</span>
      </Button>

      <span className={`text-lg font-bold min-w-[2rem] text-center ${
        data.score > 0 ? 'text-green-600 dark:text-green-400' :
        data.score < 0 ? 'text-red-600 dark:text-red-400' :
        'text-muted-foreground'
      }`}>
        {isInitialized ? (data.score > 0 ? `+${data.score}` : data.score) : '—'}
      </span>

      <Button
        variant={data.userVote === -1 ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleVote(-1)}
        disabled={isLoading}
        className={`gap-1.5 ${
          data.userVote === -1
            ? 'bg-red-600 hover:bg-red-700 text-white border-red-600'
            : 'hover:border-red-600 hover:text-red-600'
        }`}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ThumbsDown className="h-4 w-4" fill={data.userVote === -1 ? 'currentColor' : 'none'} />
        )}
        <span>{data.downvotes}</span>
      </Button>
    </div>
  )
}
