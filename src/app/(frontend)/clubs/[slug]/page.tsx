import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Users2 } from 'lucide-react'

import RichText from '@/components/RichText'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import { getClubDisplayData } from '@/modules/clubs/services/club-context'
import { ClubEnrichment } from '@/modules/clubs/components/ClubEnrichment'
import { ClubNav } from '@/modules/clubs/components/ClubNav'
import { ClubThemeWrapper } from '@/components/ClubThemeWrapper'
import type { Page as PageType } from '@/payload-types'
import PageClient from './page.client'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const clubs = await payload.find({
    collection: 'clubs',
    draft: false,
    limit: 500,
    overrideAccess: false,
    pagination: false,
    select: { slug: true },
  })

  return clubs.docs.map(({ slug }) => ({ slug: slug as string }))
}

type Args = {
  params: Promise<{ slug?: string }>
}

export default async function ClubPage({ params: paramsPromise }: Args) {
  const { slug = '' } = await paramsPromise
  const url = '/clubs/' + slug
  const club = await getClubDisplayData(slug)

  if (!club) return <PayloadRedirects url={url} />

  const payload = await getPayload({ config: configPromise })

  // Check if a Page is linked to this club (custom landing page)
  let landingPage: PageType | null = null
  if (club.cmsId) {
    const pageResult = await payload.find({
      collection: 'pages',
      where: { club: { equals: club.cmsId } },
      limit: 1,
      depth: 2,
    })
    landingPage = (pageResult.docs[0] as PageType) ?? null
  }

  // If a linked Page exists, render its hero + blocks as the landing page
  if (landingPage) {
    return (
      <ClubThemeWrapper theme={club.theme}>
        <article className="pb-16">
          <PageClient />
          <PayloadRedirects disableNotFound url={url} />

          {/* Render the Page hero */}
          <RenderHero {...(landingPage.hero as React.ComponentProps<typeof RenderHero>)} />

          {/* Sub-navigation */}
          <ClubNav
            slug={slug}
            hasTeam={Boolean(club.coordinator || club.facultyAdvisor)}
            hasAchievements={(club.recentAchievements?.length ?? 0) > 0}
          />

          {/* Render all Page blocks */}
          <RenderBlocks blocks={landingPage.layout as React.ComponentProps<typeof RenderBlocks>['blocks']} />
        </article>
      </ClubThemeWrapper>
    )
  }

  // Default view — no linked Page, show standard club detail
  // Fetch related posts
  let relatedPosts: Array<{ slug: string; title: string; meta?: { description?: string } }> = []
  if (club.relatedPostSlugs && club.relatedPostSlugs.length > 0) {
    const result = await payload.find({
      collection: 'posts',
      where: {
        slug: { in: club.relatedPostSlugs },
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

  const displayStatus = club.status === 'inactive' ? 'Inactive' : 'Active'
  const statusColor = club.status === 'inactive' ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'

  const classificationLabel = club.classification
    ? club.classification.charAt(0).toUpperCase() + club.classification.slice(1)
    : null

  return (
    <ClubThemeWrapper theme={club.theme}>
    <article className="pb-16">
      <PageClient />
      <PayloadRedirects disableNotFound url={url} />

      {/* Hero */}
      <div className="relative w-full min-h-[340px] md:min-h-[420px] overflow-hidden">
        {club.heroImageUrl ? (
          <Image
            src={club.heroImageUrl}
            alt={club.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-accent/10 to-background" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

        <div className="relative z-10 container mx-auto px-5 sm:px-6 flex flex-col justify-end h-full min-h-[340px] md:min-h-[420px] pb-8 md:pb-12">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor}`}>
              {displayStatus}
            </span>
            {classificationLabel && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-accent/10 text-accent font-medium">
                {classificationLabel}
              </span>
            )}
            {club.dataSource === 'conosco' && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                Conosco
              </span>
            )}
          </div>

          {/* Title + Logo */}
          <div className="flex items-end gap-4">
            {(club.logoUrl || club.conoscoLogoUrl) && (
              <div className="shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 border-background bg-background shadow-lg">
                <Image
                  src={club.logoUrl || club.conoscoLogoUrl || ''}
                  alt={`${club.title} logo`}
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                />
              </div>
            )}
            <div>
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-foreground">
                {club.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                {club.department && <span>{club.department}</span>}
                {club.memberCount !== undefined && club.memberCount > 0 && (
                  <>
                    <span className="text-border">·</span>
                    <span className="flex items-center gap-1">
                      <Users2 className="h-3.5 w-3.5" />
                      {club.memberCount} members
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-navigation */}
      <ClubNav
        slug={slug}
        hasTeam={Boolean(club.coordinator || club.facultyAdvisor)}
        hasAchievements={(club.recentAchievements?.length ?? 0) > 0}
      />

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 mt-10 sm:mt-14">
        <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-10 xl:gap-14">
          {/* Main content */}
          <div className="min-w-0">
            <Link
              href="/clubs"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              All clubs
            </Link>

            {/* Conosco description */}
            {club.conoscoDescription && (
              <div className="mb-8">
                <p className="text-base leading-relaxed text-muted-foreground">
                  {club.conoscoDescription}
                </p>
              </div>
            )}

            {/* Editorial rich text */}
            {club.editorialDescription && (
              <RichText
                className="prose prose-base md:prose-lg dark:prose-invert max-w-none
                  prose-headings:font-display prose-headings:tracking-tight
                  prose-a:text-accent prose-a:no-underline hover:prose-a:underline
                  prose-img:rounded-lg prose-img:mx-auto
                  prose-pre:bg-card prose-pre:border prose-pre:border-border
                  prose-blockquote:border-accent prose-blockquote:text-muted-foreground"
                data={club.editorialDescription as import('@payloadcms/richtext-lexical').DefaultTypedEditorState}
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

          {/* Sidebar */}
          <aside className="mt-10 lg:mt-0">
            <div className="lg:sticky lg:top-24">
              <ClubEnrichment club={club} />
            </div>
          </aside>
        </div>
      </div>
    </article>
    </ClubThemeWrapper>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const club = await getClubDisplayData(slug)

  if (!club) {
    return { title: 'Club Not Found' }
  }

  return {
    title: club.meta?.title || `${club.title} | GCET Clubs`,
    description:
      club.meta?.description || club.conoscoDescription || `${club.title} — GCET Club`,
    openGraph: {
      title: club.meta?.title || club.title,
      description: club.meta?.description || club.conoscoDescription,
      images: club.meta?.image?.url
        ? [{ url: club.meta.image.url }]
        : club.heroImageUrl
          ? [{ url: club.heroImageUrl }]
          : club.logoUrl
            ? [{ url: club.logoUrl }]
            : [],
    },
  }
}
