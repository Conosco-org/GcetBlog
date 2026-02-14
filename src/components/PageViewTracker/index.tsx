'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

/**
 * PageViewTracker - Automatically tracks page views on route changes.
 * Place once in the root layout. Fires a POST to /api/track on each page navigation.
 * Uses a debounce to avoid duplicate tracking on rapid navigation.
 */
export function PageViewTracker() {
  const pathname = usePathname()
  const lastTracked = useRef<string>('')

  useEffect(() => {
    // Don't track admin, payload, or API routes
    if (
      pathname.startsWith('/admin') ||
      pathname.startsWith('/api') ||
      pathname.startsWith('/admin-dashboard')
    ) {
      return
    }

    // Avoid re-tracking the same path on re-renders
    if (lastTracked.current === pathname) return
    lastTracked.current = pathname

    // Extract post slug if on a post page
    const postMatch = pathname.match(/^\/posts\/([^/]+)$/)
    const postSlug = postMatch ? postMatch[1] : undefined

    // Fire and forget - don't block rendering
    const timer = setTimeout(() => {
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: pathname,
          postSlug,
          referrer: document.referrer || '',
        }),
      }).catch(() => {
        // Silently fail - analytics should never break the UX
      })
    }, 300) // Small delay to ensure page is settled

    return () => clearTimeout(timer)
  }, [pathname])

  return null
}
