'use client'

import { Suspense, useEffect, useState, createContext, useContext } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

interface NavigationProgressContextType {
  isNavigating: boolean
}

const NavigationProgressContext = createContext<NavigationProgressContextType>({ isNavigating: false })

export function useNavigationProgress() {
  return useContext(NavigationProgressContext)
}

/** Inner component that uses useSearchParams - must be wrapped in Suspense */
function NavigationProgressInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isNavigating, setIsNavigating] = useState(false)
  const [progress, setProgress] = useState(0)

  // When route changes complete, stop the progress
  useEffect(() => {
    setIsNavigating(false)
    setProgress(0)
  }, [pathname, searchParams])

  // Listen for navigation start via click events on links
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest('a')
      if (!anchor) return

      const href = anchor.getAttribute('href')
      if (!href) return

      // Skip external links, hash links, and same-page links
      if (
        href.startsWith('http') ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        anchor.getAttribute('target') === '_blank'
      ) {
        return
      }

      // Skip if it's the same page
      const currentPath = window.location.pathname + window.location.search
      if (href === currentPath) return

      // Start progress
      setIsNavigating(true)
      setProgress(10)
    }

    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [])

  // Animate progress while navigating
  useEffect(() => {
    if (!isNavigating) return

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev
        // Slow down as we get closer to 90
        const increment = prev < 30 ? 15 : prev < 60 ? 8 : 3
        return Math.min(prev + increment, 90)
      })
    }, 300)

    return () => clearInterval(interval)
  }, [isNavigating])

  return (
    <NavigationProgressContext.Provider value={{ isNavigating }}>
      {/* Progress bar */}
      {isNavigating && (
        <div className="fixed top-0 left-0 right-0 z-[9999] h-[3px]" role="progressbar" aria-valuenow={progress} aria-label="Page loading">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
          {/* Glow effect */}
          <div
            className="absolute right-0 top-0 h-full w-24 -translate-x-full bg-gradient-to-r from-transparent to-primary/30 blur-sm"
            style={{ transform: `translateX(${progress}%)` }}
          />
        </div>
      )}
      {children}
    </NavigationProgressContext.Provider>
  )
}

/** Wrapped with Suspense to safely use useSearchParams */
export function NavigationProgressProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={children}>
      <NavigationProgressInner>{children}</NavigationProgressInner>
    </Suspense>
  )
}
