import type { Metadata } from 'next/types'

import React, { Suspense } from 'react'
import Link from 'next/link'
import { Calendar, Filter, X, ArrowRight } from 'lucide-react'
import PageClient from './page.client'
import { getEventListingData } from '@/modules/events/services/event-context'
import { EventArchive } from '@/modules/events/components/EventArchive'
import { getDepartmentOptions } from '@/custom/departments'
import { EventsFilterBar } from './EventsFilterBar'
import { getDomainScope } from '@/utilities/domainScope'

export const dynamic = 'force-dynamic'

type Args = {
  searchParams: Promise<{
    q?: string
    department?: string
    type?: string
    status?: string
    page?: string
  }>
}

export default async function EventsPage({ searchParams: searchParamsPromise }: Args) {
  const searchParams = await searchParamsPromise
  const scope = await getDomainScope()

  // ── Blog-only domain: events not available ─────────────────────────
  if (!scope.showEvents) {
    return (
      <div className="min-h-screen">
        <PageClient />
        <div className="container mx-auto px-6 py-24 text-center">
          <Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h1 className="text-2xl font-semibold mb-2">Events</h1>
          <p className="text-muted-foreground text-sm mb-6">
            Events are available on the main site. This domain is dedicated to blog content.
          </p>
          <Link
            href="/posts"
            className="inline-flex items-center gap-2 text-accent hover:underline text-sm"
          >
            Browse posts instead
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    )
  }

  const query = searchParams.q || ''
  const department = searchParams.department || ''
  const eventType = searchParams.type || ''
  const status = searchParams.status || ''
  const pageNumber = Number(searchParams.page || '1')

  const { events, totalPages, totalDocs, page } = await getEventListingData({
    page: pageNumber,
    limit: 12,
    department: department || undefined,
    eventType: eventType || undefined,
    status: status || undefined,
    search: query || undefined,
    clubSlug: scope.isClubScoped ? scope.clubScope : undefined,
  })

  const hasActiveFilters = Boolean(query || department || eventType || status)

  const departments = getDepartmentOptions()

  return (
    <div className="min-h-screen">
      <PageClient />

      {/* Header */}
      <div className="container mx-auto px-5 sm:px-6 pt-20 pb-4 md:pt-24 md:pb-6">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-accent mb-2">
            <Calendar className="h-5 w-5" />
            <span className="text-sm font-medium tracking-wide uppercase">Events</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl mb-2 leading-tight">
            {query
              ? `Results for "${query}"`
              : department
                ? departments.find((d) => d.value === department)?.label || 'Events'
                : status
                  ? `${status.charAt(0).toUpperCase() + status.slice(1)} Events`
                  : 'Events'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {hasActiveFilters
              ? `${totalDocs} ${totalDocs === 1 ? 'event' : 'events'} found`
              : 'Workshops, seminars, hackathons, and more from the GCET community.'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto px-5 sm:px-6 mb-4">
        <Suspense fallback={null}>
          <EventsFilterBar departments={departments} />
        </Suspense>
      </div>

      {/* Count */}
      <div className="container mx-auto px-5 sm:px-6 mb-4">
        <p className="text-sm text-muted-foreground">
          {totalDocs > 0
            ? `Showing ${(page - 1) * 12 + 1}–${Math.min(page * 12, totalDocs)} of ${totalDocs}`
            : 'No events found'}
        </p>
      </div>

      {/* Events Grid */}
      {events.length > 0 ? (
        <div className="container mx-auto px-5 sm:px-6">
          <EventArchive events={events} />
        </div>
      ) : (
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No events found</h3>
            <p className="text-muted-foreground text-sm mb-3">
              {hasActiveFilters
                ? 'Try adjusting your search or filters.'
                : 'No events have been published yet.'}
            </p>
            {hasActiveFilters && (
              <Link
                href="/events"
                className="inline-flex items-center gap-1 text-accent hover:underline text-sm"
              >
                <X className="h-3 w-3" />
                Clear all filters
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="container mx-auto px-5 sm:px-6 py-10">
          <div className="flex items-center justify-center gap-2">
            {page > 1 && (
              <Link
                href={buildPageUrl(searchParams, page - 1)}
                className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted transition-colors"
              >
                Previous
              </Link>
            )}
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pageNum = getPageNumber(i, page, totalPages)
              return (
                <Link
                  key={pageNum}
                  href={buildPageUrl(searchParams, pageNum)}
                  className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                    pageNum === page
                      ? 'bg-accent text-accent-foreground font-medium'
                      : 'border border-border hover:bg-muted'
                  }`}
                >
                  {pageNum}
                </Link>
              )
            })}
            {page < totalPages && (
              <Link
                href={buildPageUrl(searchParams, page + 1)}
                className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted transition-colors"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function buildPageUrl(
  params: Record<string, string | undefined>,
  pageNum: number,
): string {
  const sp = new URLSearchParams()
  if (params.q) sp.set('q', params.q)
  if (params.department) sp.set('department', params.department)
  if (params.type) sp.set('type', params.type)
  if (params.status) sp.set('status', params.status)
  if (pageNum > 1) sp.set('page', String(pageNum))
  const qs = sp.toString()
  return `/events${qs ? `?${qs}` : ''}`
}

function getPageNumber(index: number, currentPage: number, totalPages: number): number {
  if (totalPages <= 5) return index + 1
  if (currentPage <= 3) return index + 1
  if (currentPage >= totalPages - 2) return totalPages - 4 + index
  return currentPage - 2 + index
}

export function generateMetadata(): Metadata {
  return {
    title: 'Events | GCET Blog',
    description: 'Browse upcoming and past events from GCET — workshops, seminars, hackathons, and more.',
  }
}
