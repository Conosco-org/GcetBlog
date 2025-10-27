'use client'

import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

export function ConditionalLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isEditorRoute = pathname?.startsWith('/editor')

  // For editor routes, only show the children (which includes the editor layout)
  if (isEditorRoute) {
    // Find and return only the middle child (the actual page content)
    const childArray = Array.isArray(children) ? children : [children]
    return <>{childArray[1]}</> // Return only the {children} part, skip Header and Footer
  }

  // For non-editor routes, show everything (Header + children + Footer)
  return <>{children}</>
}
