'use client'

import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

export function ConditionalLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isEditorRoute = pathname?.startsWith('/editor')
  
  // Pages without footer: home, posts list, posts pagination, individual posts, contact
  const isPageWithoutFooter = 
    pathname === '/' || 
    pathname === '/posts' || 
    pathname?.startsWith('/posts/') || 
    pathname === '/contact'

  // For editor routes, only show the children (which includes the editor layout)
  if (isEditorRoute) {
    // Find and return only the middle child (the actual page content)
    const childArray = Array.isArray(children) ? children : [children]
    return <>{childArray[1]}</> // Return only the {children} part, skip Header and Footer
  }

  // For pages without footer (home, posts, contact), show Header + children only
  if (isPageWithoutFooter) {
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
