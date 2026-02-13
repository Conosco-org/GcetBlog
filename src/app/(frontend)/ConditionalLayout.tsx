'use client'

import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

export function ConditionalLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isEditorRoute = pathname?.startsWith('/editor')

  // For editor routes, only show the page content (skip Header)
  if (isEditorRoute) {
    const childArray = Array.isArray(children) ? children : [children]
    return <>{childArray[1]}</>
  }

  return <>{children}</>
}
