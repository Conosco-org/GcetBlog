import type { Metadata } from 'next'

import { RelatedPosts } from '@/blocks/RelatedPosts/Component'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import RichText from '@/components/RichText'

import type { Post } from '@/payload-types'

import { PostHero } from '@/heros/PostHero'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { PostComments } from '@/components/PostComments'
import { DraftModeBanner } from '@/components/DraftModeBanner'
import { PostEngagement } from './PostEngagement'
import { InstagramEmbedLoader } from '@/components/InstagramEmbedLoader'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const posts = await payload.find({
    collection: 'posts',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  const params = posts.docs.map(({ slug }) => {
    return { slug }
  })

  return params
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Post({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  const url = '/posts/' + slug
  const post = await queryPostBySlug({ slug })

  if (!post) return <PayloadRedirects url={url} />

  return (
    <article className="pt-16 pb-16">
      {draft && <DraftModeBanner postStatus={post._status || 'draft'} />}
      
      <PageClient />
      <InstagramEmbedLoader />

      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <PostHero post={post} />

      <div className="flex flex-col items-center gap-4 pt-8">
        <div className="container">
          {/* Tags */}
          {post.tags && Array.isArray(post.tags) && (post.tags as string[]).length > 0 && (
            <div className="max-w-[48rem] mx-auto flex flex-wrap gap-1.5 mb-6">
              {(post.tags as string[]).map((tag) => (
                <a
                  key={tag}
                  href={`/posts?tag=${encodeURIComponent(tag)}`}
                  className="px-2 py-1 text-xs rounded-md bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                >
                  #{tag}
                </a>
              ))}
            </div>
          )}

          <RichText className="max-w-[48rem] mx-auto" data={post.content} enableGutter={false} />

          {/* Vote & Share Buttons */}
          <PostEngagement postId={String(post.id)} postSlug={post.slug || ''} postTitle={post.title} postDescription={post.meta?.description || ''} />

          {post.relatedPosts && post.relatedPosts.length > 0 && (
            <RelatedPosts
              className="mt-12 max-w-[52rem] lg:grid lg:grid-cols-subgrid col-start-1 col-span-3 grid-rows-[2fr]"
              docs={post.relatedPosts.filter((post) => typeof post === 'object')}
            />
          )}

          {/* Comments Section */}
          <PostComments post={post} />
        </div>
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const post = await queryPostBySlug({ slug })

  return generateMeta({ doc: post })
}

const queryPostBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  // If draft mode is enabled, allow viewing drafts with overrideAccess
  // The security is already handled by the /api/draft route which checks editor/admin role
  const result = await payload.find({
    collection: 'posts',
    draft,
    limit: 1,
    overrideAccess: draft, // Only override access if draft mode is enabled
    pagination: false,
    where: {
      and: [
        {
          slug: {
            equals: slug,
          },
        },
        // If not in draft mode, only show published posts
        ...(draft
          ? []
          : [
              {
                _status: {
                  equals: 'published' as const,
                },
              },
            ]),
      ],
    },
  })

  return result.docs?.[0] || null
})