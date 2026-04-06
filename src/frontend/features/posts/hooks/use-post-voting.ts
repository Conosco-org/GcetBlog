'use client'

import { useState, useRef } from 'react'

interface VoteState {
  likes: number
  userVote: 1 | -1 | null
}

interface UsePostVotingOptions {
  postId: string
  initialLikes?: number
  initialUserVote?: 1 | -1 | null
}

export function usePostVoting({
  postId,
  initialLikes = 0,
  initialUserVote = null,
}: UsePostVotingOptions) {
  const [state, setState] = useState<VoteState>({
    likes: initialLikes,
    userVote: initialUserVote,
  })
  const pendingRef = useRef(false)

  const handleVote = async (value: 1 | -1) => {
    if (pendingRef.current) return

    // Optimistic update - instant feedback
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

  return {
    likes: state.likes,
    userVote: state.userVote,
    handleVote,
    isLiked: state.userVote === 1,
    isDisliked: state.userVote === -1,
  }
}
