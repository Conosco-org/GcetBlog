import type { Metadata } from 'next'

import { RelatedPosts } from '@/blocks/RelatedPosts/Component'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode, headers as nextHeaders } from 'next/headers'
import React, { cache } from 'react'
import Link from 'next/link'
import RichText from '@/components/RichText'

import type { Post } from '@/payload-types'

import { PostHero } from '@/heros/PostHero'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { PostComments } from '@/components/PostComments'
import { DraftModeBanner } from '@/components/DraftModeBanner'
import { PostEngagement } from './PostEngagement'
import { NewsletterSignup } from '@/components/NewsletterSignup'
import { InstagramEmbedLoader } from '@/components/InstagramEmbedLoader'
import { getServerSideURL } from '@/utilities/getURL'

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

  // Fetch recommended posts (same categories, excluding current post)
  const payload = await getPayload({ config: configPromise })
  const categoryIds = post.categories
    ? post.categories.filter((c) => typeof c === 'object').map((c: any) => c.id)
    : []

  const recommendedPosts = await payload.find({
    collection: 'posts',
    limit: 4,
    overrideAccess: true,
    where: {
      and: [
        { _status: { equals: 'published' } },
        { id: { not_equals: post.id } },
        ...(categoryIds.length > 0
          ? [{ categories: { in: categoryIds } }]
          : []),
      ],
    },
    sort: '-publishedAt',
    depth: 1,
  })

  // Check the current user's vote server-side - no client GET needed
  const initialLikes: number = (post as any).likesCount ?? 0
  let initialUserVote: 1 | -1 | null = null
  try {
    const reqHeaders = await nextHeaders()
    const { user } = await payload.auth({ headers: reqHeaders })
    if (user) {
      const myVote = await payload.find({
        collection: 'votes',
        where: { and: [{ post: { equals: post.id } }, { user: { equals: user.id } }] },
        limit: 1,
      })
      if (myVote.docs.length > 0) {
        initialUserVote = (myVote.docs[0]!.value as 1 | -1) ?? null
      }
    }
  } catch {
    // Unauthenticated - fine
  }

  const canonicalUrl = `${getServerSideURL()}/posts/${post.slug}`
  const postJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.meta?.title || post.title,
    description: post.meta?.description || '',
    url: canonicalUrl,
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt,
    image:
      typeof post.meta?.image === 'object' && post.meta.image?.url
        ? `${getServerSideURL()}${post.meta.image.url}`
        : `${getServerSideURL()}/gcet-logo.png`,
  }

  return (
    <article className="pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(postJsonLd) }}
      />
      {draft && <DraftModeBanner postStatus={post._status || 'draft'} />}
      <PageClient />
      <InstagramEmbedLoader />
      <PayloadRedirects disableNotFound url={url} />
      {draft && <LivePreviewListener />}

      {/* Hero - full width, no top padding (header floats over it) */}
      <PostHero post={post} />

      {/* Main content - industry standard two-col layout on desktop */}
      <div className="container mx-auto px-4 sm:px-6 mt-10 sm:mt-14">
        <div className="lg:grid lg:grid-cols-[1fr_680px_1fr] xl:grid-cols-[1fr_720px_1fr]">
          {/* Left: Sticky vote buttons on desktop */}
          <div className="hidden lg:flex lg:col-start-1 lg:justify-end lg:pr-6">
            <div className="sticky top-24 flex flex-col items-center gap-4 pt-2">
              <PostEngagement
                postId={String(post.id)}
                postSlug={post.slug || ''}
                postTitle={post.title}
                postDescription={post.meta?.description || ''}
                initialLikes={initialLikes}
                initialUserVote={initialUserVote}
                variant="sidebar"
              />
            </div>
          </div>

          {/* Center: Article content */}
          <div className="lg:col-start-2">
            {/* Tags */}
            {post.tags && Array.isArray(post.tags) && (post.tags as string[]).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-6">
                {(post.tags as string[]).map((tag) => (
                  <Link
                    key={tag}
                    href={`/posts?tag=${encodeURIComponent(tag)}`}
                    className="px-2.5 py-1 text-xs rounded-full bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Rich text content */}
            <RichText
              className="prose prose-base md:prose-lg dark:prose-invert max-w-none
                prose-headings:font-display prose-headings:tracking-tight
                prose-a:text-accent prose-a:no-underline hover:prose-a:underline
                prose-img:rounded-lg prose-img:mx-auto
                prose-pre:bg-card prose-pre:border prose-pre:border-border
                prose-blockquote:border-accent prose-blockquote:text-muted-foreground"
              data={post.content}
              enableGutter={false}
              enableProse={false}
            />

            {/* Mobile: Vote + Share (below content on mobile) */}
            <div className="lg:hidden mt-8">
              <PostEngagement
                postId={String(post.id)}
                postSlug={post.slug || ''}
                postTitle={post.title}
                postDescription={post.meta?.description || ''}
                initialLikes={initialLikes}
                initialUserVote={initialUserVote}
                variant="inline"
              />
            </div>

            {/* Desktop: Share buttons after content */}
            <div className="hidden lg:block mt-8">
              <PostEngagement
                postId={String(post.id)}
                postSlug={post.slug || ''}
                postTitle={post.title}
                postDescription={post.meta?.description || ''}
                initialLikes={initialLikes}
                initialUserVote={initialUserVote}
                variant="share-only"
              />
            </div>

            {/* Related posts - inline on mobile */}
            {recommendedPosts.docs.length > 0 && (
              <div className="lg:hidden mt-12 pt-8 border-t border-border">
                <h2 className="text-xl font-display font-bold mb-5">More to read</h2>
                <RelatedPosts docs={recommendedPosts.docs} />
              </div>
            )}

            {/* Newsletter signup banner - invite visitors to subscribe */}
            <div className="mt-12 rounded-2xl bg-accent/5 dark:bg-accent/10 border border-accent/20 p-6 sm:p-8">
              <div className="flex items-start gap-3 mb-4">
                <div>
                  <h3 className="text-lg font-semibold leading-snug">Stay in the loop</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Get new articles from GCET directly in your inbox. No spam, just knowledge.
                  </p>
                </div>
              </div>
              <NewsletterSignup variant="inline" className="max-w-md" />
            </div>

            {/* Comments */}
            <PostComments post={post} />
          </div>

          {/* Right: Recommended posts on desktop */}
          <div className="hidden lg:block lg:col-start-3 lg:pl-8">
            {recommendedPosts.docs.length > 0 && (
              <div className="sticky top-24">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">
                  More to read
                </h2>
                <div className="space-y-4">
                  {recommendedPosts.docs.slice(0, 3).map((recPost) => (
                    <Link
                      key={recPost.id}
                      href={`/posts/${recPost.slug}`}
                      className="group block"
                    >
                      <article className="flex gap-3 items-start">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium leading-snug group-hover:text-accent transition-colors line-clamp-2">
                            {recPost.title}
                          </h3>
                          {recPost.meta?.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {recPost.meta.description}
                            </p>
                          )}
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const post = await queryPostBySlug({ slug })

  return generateMeta({ doc: post, pathname: `/posts/${slug}` })
}

const queryPostBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'posts',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      and: [
        {
          slug: {
            equals: slug,
          },
        },
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