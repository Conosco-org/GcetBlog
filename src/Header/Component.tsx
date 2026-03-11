import { HeaderClient } from './Component.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import React from 'react'
import { getDomainScope, getNavItemsForScope } from '@/utilities/domainScope'

import type { Header } from '@/payload-types'

export async function Header() {
  const headerData: Header = await getCachedGlobal('header', 1)()

  // Compute navigation items based on domain scope
  const scope = await getDomainScope()
  const scopedNavItems = getNavItemsForScope(scope)

  // Fetch categories for search filter
  let categories: Array<{ id: string; title: string; slug: string }> = []
  try {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'categories',
      limit: 20,
      sort: 'title',
      select: { title: true, slug: true },
    })
    categories = result.docs.map((doc) => ({
      id: String(doc.id),
      title: doc.title || '',
      slug: doc.slug || '',
    }))
  } catch {
    // Categories are optional for search
  }

  return <HeaderClient data={headerData} categories={categories} scopedNavItems={scopedNavItems} domainPurpose={scope.purpose} />
}
