'use client'

import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

export function ConditionalLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isEditorRoute = pathname?.startsWith('/editor')
  
  // Landing pages without footer: home, posts list, posts pagination, contact
  const isLandingPageWithoutFooter = 
    pathname === '/' || 
    pathname === '/posts' || 
    pathname?.startsWith('/posts/page/') || 
    pathname === '/contact'

  // For editor routes, only show the children (which includes the editor layout)
  if (isEditorRoute) {
    // Find and return only the middle child (the actual page content)
    const childArray = Array.isArray(children) ? children : [children]
    return <>{childArray[1]}</> // Return only the {children} part, skip Header and Footer
  }

  // For landing pages (home, posts list, contact), show Header + children (no Footer)
  if (isLandingPageWithoutFooter) {
    const childArray = Array.isArray(children) ? children : [children]
    return (
      <>
        {childArray[0]} {/* Header */}
        {childArray[1]} {/* Page content */}
      </>
    )
  }

  // For all other routes including individual posts, show everything (Header + children + Footer)
  return <>{children}</>
}
