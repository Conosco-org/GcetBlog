import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import RichText from '@/components/RichText'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import { getEventDisplayData } from '@/modules/events/services/event-context'
import { EventHero, EventEnrichment } from '@/modules/events/components/EventHero'
import PageClient from './page.client'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const events = await payload.find({
    collection: 'events',
    draft: false,
    limit: 500,
    overrideAccess: false,
    pagination: false,
    select: { slug: true },
  })

  return events.docs.map(({ slug }) => ({ slug: slug as string }))
}

type Args = {
  params: Promise<{ slug?: string }>
}

export default async function EventPage({ params: paramsPromise }: Args) {
  const { slug = '' } = await paramsPromise
  const url = '/events/' + slug
  const event = await getEventDisplayData(slug)

  if (!event) return <PayloadRedirects url={url} />

  // Fetch related posts if any
  const payload = await getPayload({ config: configPromise })
  let relatedPosts: Array<{ slug: string; title: string; meta?: { description?: string } }> = []
  if (event.relatedPostSlugs && event.relatedPostSlugs.length > 0) {
    const result = await payload.find({
      collection: 'posts',
      where: {
        slug: { in: event.relatedPostSlugs },
        _status: { equals: 'published' },
      },
      limit: 5,
      depth: 0,
      select: { slug: true, title: true, meta: true },
    })
    relatedPosts = result.docs.map((p) => ({
      slug: p.slug as string,
      title: p.title,
      meta: p.meta as { description?: string } | undefined,
    }))
  }

  return (
    <article className="pb-16">
      <PageClient />
      <PayloadRedirects disableNotFound url={url} />

      {/* Hero */}
      <EventHero event={event} />

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 mt-10 sm:mt-14">
        <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-10 xl:gap-14">
          {/* Main content */}
          <div className="min-w-0">
            {/* Back link */}
            <Link
              href="/events"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              All events
            </Link>

            {/* Conosco description */}
            {event.conoscoDescription && (
              <div className="mb-8">
                <p className="text-base leading-relaxed text-muted-foreground">
                  {event.conoscoDescription}
                </p>
              </div>
            )}

            {/* Editorial rich text */}
            {event.editorialDescription && (
              <RichText
                className="prose prose-base md:prose-lg dark:prose-invert max-w-none
                  prose-headings:font-display prose-headings:tracking-tight
                  prose-a:text-accent prose-a:no-underline hover:prose-a:underline
                  prose-img:rounded-lg prose-img:mx-auto
                  prose-pre:bg-card prose-pre:border prose-pre:border-border
                  prose-blockquote:border-accent prose-blockquote:text-muted-foreground"
                data={event.editorialDescription as import('@payloadcms/richtext-lexical').DefaultTypedEditorState}
                enableGutter={false}
                enableProse={false}
              />
            )}

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div className="mt-12 pt-8 border-t border-border">
                <h2 className="text-xl font-display font-bold mb-4">Related Posts</h2>
                <div className="space-y-3">
                  {relatedPosts.map((post) => (
                    <Link
                      key={post.slug}
                      href={`/posts/${post.slug}`}
                      className="group block p-4 rounded-xl border border-border hover:border-accent/30 transition-colors"
                    >
                      <h3 className="font-medium group-hover:text-accent transition-colors">
                        {post.title}
                      </h3>
                      {post.meta?.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {post.meta.description}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar — Enrichment panels */}
          <aside className="mt-10 lg:mt-0">
            <div className="lg:sticky lg:top-24">
              <EventEnrichment event={event} />
            </div>
          </aside>
        </div>
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const event = await getEventDisplayData(slug)

  if (!event) {
    return { title: 'Event Not Found' }
  }

  return {
    title: event.meta?.title || `${event.title} | GCET Events`,
    description:
      event.meta?.description || event.conoscoDescription || `${event.title} — GCET Event`,
    openGraph: {
      title: event.meta?.title || event.title,
      description: event.meta?.description || event.conoscoDescription,
      images: event.meta?.image?.url
        ? [{ url: event.meta.image.url }]
        : event.heroImageUrl
          ? [{ url: event.heroImageUrl }]
          : event.posterUrl
            ? [{ url: event.posterUrl }]
            : [],
    },
  }
}
