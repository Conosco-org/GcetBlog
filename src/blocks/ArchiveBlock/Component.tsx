import type { Post, ArchiveBlock as ArchiveBlockProps } from '@/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import RichText from '@/components/RichText'
import { getCurrentTenant } from '@/utilities/tenantContext'

import { CollectionArchive } from '@/components/CollectionArchive'

export const ArchiveBlock: React.FC<
  ArchiveBlockProps & {
    id?: string
  }
> = async (props) => {
  const { id, categories, introContent, limit: limitFromProps, populateBy, selectedDocs } = props

  const limit = limitFromProps || 3

  let posts: Post[] = []

  if (populateBy === 'collection') {
    const payload = await getPayload({ config: configPromise })
    const tenant = await getCurrentTenant()

    const flattenedCategories = categories?.map((category) => {
      if (typeof category === 'object') return category.id
      else return category
    })

    // Build where clause with institution filter
    const whereConditions: any[] = []
    
    // Add institution filter
    if (tenant) {
      whereConditions.push({ institution: { equals: tenant.institutionId } })
    }
    
    // Add category filter if provided
    if (flattenedCategories && flattenedCategories.length > 0) {
      whereConditions.push({ categories: { in: flattenedCategories } })
    }

    const fetchedPosts = await payload.find({
      collection: 'posts',
      depth: 1,
      limit,
      where: whereConditions.length > 0 ? { and: whereConditions } : undefined,
    })

    posts = fetchedPosts.docs
  } else {
    if (selectedDocs?.length) {
      const filteredSelectedPosts = selectedDocs.map((post) => {
        if (typeof post.value === 'object') return post.value
      }) as Post[]

      posts = filteredSelectedPosts
    }
  }

  return (
    <div className="my-16" id={`block-${id}`}>
      {introContent && (
        <div className="container mb-16">
          <RichText className="ms-0 max-w-[48rem]" data={introContent} enableGutter={false} />
        </div>
      )}
      <CollectionArchive posts={posts} />
    </div>
  )
}
