'use client'

import React, { useState, useRef } from 'react'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import { cn } from '@/utilities/ui'

interface VoteButtonsProps {
  postId: string
  /** Like count from the post document (no separate GET needed) */
  initialLikes?: number
  /** Whether the current user has already voted (fetched server-side) */
  initialUserVote?: 1 | -1 | null
  className?: string
  variant?: 'compact' | 'full'
}

interface VoteState {
  likes: number
  userVote: 1 | -1 | null
}

export function VoteButtons({
  postId,
  initialLikes = 0,
  initialUserVote = null,
  className,
  variant = 'full',
}: VoteButtonsProps) {
  const [state, setState] = useState<VoteState>({
    likes: initialLikes,
    userVote: initialUserVote,
  })
  const pendingRef = useRef(false)

  const handleVote = async (value: 1 | -1) => {
    if (pendingRef.current) return

    // Optimistic update — instant feedback
    const prev = { ...state }
    setState((s) => {
      const isSame = s.userVote === value

      if (isSame) {
        // Toggle off
        return { likes: value === 1 ? Math.max(0, s.likes - 1) : s.likes, userVote: null }
      }

      const wasLiked = s.userVote === 1
      const nowLiking = value === 1

      // Switching from like→dislike
      if (wasLiked && !nowLiking) return { likes: Math.max(0, s.likes - 1), userVote: value }
      // Switching from dislike→like or new like
      if (nowLiking) return { likes: s.likes + 1, userVote: value }
      // New dislike
      return { likes: s.likes, userVote: value }
    })

    pendingRef.current = true
    try {
      const res = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, value }),
      })

      if (res.ok) {
        const result = await res.json()
        setState({ likes: result.upvotes, userVote: result.userVote })
      } else if (res.status === 401) {
        setState(prev)
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}&message=Sign in to vote`
      } else {
        setState(prev)
      }
    } catch {
      setState(prev)
    } finally {
      pendingRef.current = false
    }
  }

  const liked = state.userVote === 1
  const disliked = state.userVote === -1

  if (variant === 'compact') {
    return (
      <div className={cn('flex flex-col items-center gap-3', className)}>
        {/* Like */}
        <button
          onClick={() => handleVote(1)}
          className={cn(
            'flex flex-col items-center gap-1 p-2 rounded-full transition-all duration-150 active:scale-90',
            liked ? 'text-accent' : 'text-muted-foreground hover:text-accent',
          )}
          aria-label="Like"
          aria-pressed={liked}
        >
          <ThumbsUp className="h-4 w-4" fill={liked ? 'currentColor' : 'none'} />
          <span className="text-xs font-medium tabular-nums leading-none">{state.likes}</span>
        </button>

        {/* Dislike — no count */}
        <button
          onClick={() => handleVote(-1)}
          className={cn(
            'p-2 rounded-full transition-all duration-150 active:scale-90',
            disliked ? 'text-destructive' : 'text-muted-foreground hover:text-destructive',
          )}
          aria-label="Dislike"
          aria-pressed={disliked}
        >
          <ThumbsDown className="h-4 w-4" fill={disliked ? 'currentColor' : 'none'} />
        </button>
      </div>
    )
  }

  // Full variant
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {/* Like button with count */}
      <button
        onClick={() => handleVote(1)}
        aria-label="Like"
        aria-pressed={liked}
        className={cn(
          'inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all duration-150 active:scale-95',
          liked
            ? 'bg-accent text-accent-foreground border-accent shadow-sm'
            : 'border-border text-muted-foreground hover:border-accent hover:text-accent hover:bg-accent/5',
        )}
      >
        <ThumbsUp
          className={cn('h-4 w-4 transition-transform duration-150', liked && 'scale-110')}
          fill={liked ? 'currentColor' : 'none'}
        />
        <span className="tabular-nums">{state.likes}</span>
      </button>

      {/* Divider */}
      <div className="w-px h-6 bg-border mx-1" />

      {/* Dislike — no count */}
      <button
        onClick={() => handleVote(-1)}
        aria-label="Dislike"
        aria-pressed={disliked}
        className={cn(
          'p-2 rounded-full border text-sm transition-all duration-150 active:scale-95',
          disliked
            ? 'bg-destructive/10 text-destructive border-destructive/30'
            : 'border-border text-muted-foreground hover:border-destructive/40 hover:text-destructive hover:bg-destructive/5',
        )}
      >
        <ThumbsDown
          className={cn('h-4 w-4 transition-transform duration-150', disliked && 'scale-110')}
          fill={disliked ? 'currentColor' : 'none'}
        />
      </button>
    </div>
  )
}
