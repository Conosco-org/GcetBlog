import { HeaderClient } from './header.client'
import { getCachedGlobal } from '@backend/lib/get-globals'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import React from 'react'

import type { Header } from '@shared/types/payload-types'

export async function Header() {
  const headerData: Header = await getCachedGlobal('header', 1)()

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

  return <HeaderClient data={headerData} categories={categories} />
}
