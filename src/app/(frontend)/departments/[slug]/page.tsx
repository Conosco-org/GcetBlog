import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  GraduationCap,
  Users,
  BookOpen,
  Calendar,
  Globe,
  Instagram,
  Linkedin,
  Mail,
} from 'lucide-react'

import RichText from '@/components/RichText'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import { getDepartmentDisplayData } from '@/modules/departments/services/department-context'
import PageClient from './page.client'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const departments = await payload.find({
    collection: 'departments',
    draft: false,
    limit: 500,
    overrideAccess: false,
    pagination: false,
    select: { slug: true },
  })

  return departments.docs.map(({ slug }) => ({ slug: slug as string }))
}

type Args = {
  params: Promise<{ slug?: string }>
}

export default async function DepartmentPage({ params: paramsPromise }: Args) {
  const { slug = '' } = await paramsPromise
  const url = '/departments/' + slug
  const department = await getDepartmentDisplayData(slug)

  if (!department) return <PayloadRedirects url={url} />

  const payload = await getPayload({ config: configPromise })

  // Fetch related posts
  let relatedPosts: Array<{ slug: string; title: string; meta?: { description?: string } }> = []
  if (department.relatedPostSlugs && department.relatedPostSlugs.length > 0) {
    const result = await payload.find({
      collection: 'posts',
      where: {
        slug: { in: department.relatedPostSlugs },
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

  // Fetch related clubs
  let relatedClubs: Array<{ slug: string; title: string }> = []
  if (department.relatedClubSlugs && department.relatedClubSlugs.length > 0) {
    const result = await payload.find({
      collection: 'clubs',
      where: {
        slug: { in: department.relatedClubSlugs },
        _status: { equals: 'published' },
      },
      limit: 6,
      depth: 0,
      select: { slug: true, title: true },
    })
    relatedClubs = result.docs.map((c) => ({
      slug: c.slug as string,
      title: c.title,
    }))
  }

  // Inject per-department CSS vars
  const themeStyle = department.theme
    ? ({
        '--dept-primary': department.theme.primaryColor || '#0047AB',
        '--dept-accent': department.theme.accentColor || '',
      } as React.CSSProperties)
    : undefined

  return (
    <article className="pb-16" style={themeStyle}>
      <PageClient />
      <PayloadRedirects disableNotFound url={url} />

      {/* Hero */}
      <div className="relative w-full min-h-[300px] md:min-h-[380px] overflow-hidden">
        {department.heroImageUrl ? (
          <Image
            src={department.heroImageUrl}
            alt={department.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-indigo-500/10 to-background" />
        )}
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

        {/* Back nav */}
        <div className="absolute top-6 left-0 right-0 container mx-auto px-6">
          <Link
            href="/departments"
            className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-lg"
          >
            <ArrowLeft className="h-4 w-4" />
            All Departments
          </Link>
        </div>

        {/* Title block */}
        <div className="absolute bottom-0 left-0 right-0 container mx-auto px-6 pb-8 md:pb-12">
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap className="h-5 w-5 text-accent" />
            <span className="text-sm font-mono font-bold text-accent uppercase tracking-widest">
              {department.code}
            </span>
            {department.category && (
              <span className="text-sm text-muted-foreground capitalize">— {department.category}</span>
            )}
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground leading-tight max-w-3xl">
            {department.title}
          </h1>
          {department.shortDescription && (
            <p className="mt-3 text-base md:text-lg text-muted-foreground max-w-2xl">
              {department.shortDescription}
            </p>
          )}
        </div>
      </div>

      {/* Stats bar */}
      {(department.facultyCount || department.studentCount || department.yearEstablished) && (
        <div className="border-b border-border bg-muted/30">
          <div className="container mx-auto px-6 py-4">
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              {department.yearEstablished && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Est. {department.yearEstablished}</span>
                </div>
              )}
              {department.facultyCount !== undefined && department.facultyCount > 0 && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{department.facultyCount} Faculty Members</span>
                </div>
              )}
              {department.studentCount !== undefined && department.studentCount > 0 && (
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>{department.studentCount} Students</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="container mx-auto px-6 py-10 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left: Editorial content */}
          <div className="lg:col-span-2">
            {department.editorialDescription && (
              <div className="prose dark:prose-invert max-w-none">
                <RichText data={department.editorialDescription} />
              </div>
            )}

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div className="mt-10">
                <h2 className="text-xl font-bold mb-4">Related Posts</h2>
                <ul className="space-y-3">
                  {relatedPosts.map((post) => (
                    <li key={post.slug}>
                      <Link
                        href={`/posts/${post.slug}`}
                        className="group flex flex-col gap-0.5 p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors"
                      >
                        <span className="font-medium group-hover:text-accent transition-colors">
                          {post.title}
                        </span>
                        {post.meta?.description && (
                          <span className="text-sm text-muted-foreground line-clamp-2">
                            {post.meta.description}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Related Clubs */}
            {relatedClubs.length > 0 && (
              <div className="mt-10">
                <h2 className="text-xl font-bold mb-4">Affiliated Clubs</h2>
                <div className="flex flex-wrap gap-2">
                  {relatedClubs.map((club) => (
                    <Link
                      key={club.slug}
                      href={`/clubs/${club.slug}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      {club.title}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Sidebar */}
          <div className="space-y-6">
            {/* HOD Card */}
            {department.hod?.name && (
              <div className="rounded-2xl border border-border bg-card p-5">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
                  Head of Department
                </h3>
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                    <Users className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{department.hod.name}</p>
                    {department.hod.designation && (
                      <p className="text-xs text-muted-foreground mt-0.5">{department.hod.designation}</p>
                    )}
                    {department.hod.email && (
                      <a
                        href={`mailto:${department.hod.email}`}
                        className="flex items-center gap-1 text-xs text-accent hover:underline mt-1"
                      >
                        <Mail className="h-3 w-3" />
                        {department.hod.email}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Social Links */}
            {department.socialLinks &&
              (department.socialLinks.website ||
                department.socialLinks.instagram ||
                department.socialLinks.linkedin) && (
                <div className="rounded-2xl border border-border bg-card p-5">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
                    Connect
                  </h3>
                  <div className="flex flex-col gap-2">
                    {department.socialLinks.website && (
                      <a
                        href={department.socialLinks.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Globe className="h-4 w-4" />
                        Website
                      </a>
                    )}
                    {department.socialLinks.instagram && (
                      <a
                        href={department.socialLinks.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Instagram className="h-4 w-4" />
                        Instagram
                      </a>
                    )}
                    {department.socialLinks.linkedin && (
                      <a
                        href={department.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Linkedin className="h-4 w-4" />
                        LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              )}

            {/* Quick links */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
                Explore
              </h3>
              <div className="flex flex-col gap-2">
                <Link
                  href={`/posts?department=${department.code}`}
                  className="text-sm text-muted-foreground hover:text-accent transition-colors"
                >
                  → Posts from {department.code}
                </Link>
                <Link
                  href={`/events?department=${department.code}`}
                  className="text-sm text-muted-foreground hover:text-accent transition-colors"
                >
                  → Events from {department.code}
                </Link>
                <Link
                  href={`/clubs?department=${department.code}`}
                  className="text-sm text-muted-foreground hover:text-accent transition-colors"
                >
                  → Clubs in {department.code}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const department = await getDepartmentDisplayData(slug)

  if (!department) return { title: 'Department Not Found' }

  return {
    title: department.meta?.title || `${department.title} | GCET`,
    description:
      department.meta?.description ||
      department.shortDescription ||
      `Learn about the ${department.title} at GCET.`,
    openGraph: department.meta?.image?.url
      ? { images: [{ url: department.meta.image.url }] }
      : undefined,
  }
}
