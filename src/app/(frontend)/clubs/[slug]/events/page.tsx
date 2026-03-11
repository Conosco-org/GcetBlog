import type { Metadata } from 'next'
import React from 'react'
import { Calendar } from 'lucide-react'

import { getClubDisplayData } from '@/modules/clubs/services/club-context'
import { getClubEventsForDisplay } from '@/modules/events/services/event-context'
import { EventArchive } from '@/modules/events/components/EventArchive'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import { ClubSubPageHeader } from '@/modules/clubs/components/ClubSubPageHeader'
import { ClubNav } from '@/modules/clubs/components/ClubNav'

export const dynamic = 'force-dynamic'

type Args = {
  params: Promise<{ slug?: string }>
  searchParams: Promise<{ page?: string; status?: string }>
}

export default async function ClubEventsPage({ params: paramsPromise, searchParams: searchParamsPromise }: Args) {
  const { slug = '' } = await paramsPromise
  const searchParams = await searchParamsPromise
  const url = `/clubs/${slug}/events`

  const club = await getClubDisplayData(slug)
  if (!club) return <PayloadRedirects url={url} />

  const pageNumber = Number(searchParams.page || '1')
  const status = searchParams.status || ''

  const { events, totalPages, totalDocs, page } = await getClubEventsForDisplay({
    clubId: club.cmsId!,
    page: pageNumber,
    limit: 12,
    status: status || undefined,
  })

  // Also count Conosco recent events from the club data
  const hasConoscoEvents = (club.recentEvents?.length ?? 0) > 0

  return (
    <div className="min-h-screen">
      <ClubSubPageHeader
        club={club}
        title={`${club.title} Events`}
        description={`Workshops, seminars, and events organized by ${club.title}`}
      />
      <ClubNav
        slug={slug}
        hasTeam={Boolean(club.coordinator || club.facultyAdvisor)}
        hasAchievements={(club.recentAchievements?.length ?? 0) > 0}
      />

      <div className="container mx-auto px-4 sm:px-6 py-8 md:py-10">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar">
          {['', 'upcoming', 'ongoing', 'completed'].map((s) => {
            const label = s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)
            const isActive = status === s
            const href = s
              ? `/clubs/${slug}/events?status=${s}`
              : `/clubs/${slug}/events`
            return (
              <a
                key={s}
                href={href}
                className={`px-3 py-1.5 text-sm rounded-full whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {label}
              </a>
            )
          })}
        </div>

        {/* Count */}
        <p className="text-sm text-muted-foreground mb-6">
          {totalDocs > 0
            ? `${totalDocs} ${totalDocs === 1 ? 'event' : 'events'} found`
            : 'No events found'}
        </p>

        {/* Events Grid */}
        {events.length > 0 ? (
          <EventArchive events={events} />
        ) : (
          <div className="text-center py-16">
            <Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No events yet</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              {hasConoscoEvents
                ? 'Events from Conosco are showing on the overview page. CMS-published events will appear here.'
                : `${club.title} hasn't published any events yet. Check back soon!`}
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <a
                key={p}
                href={`/clubs/${slug}/events?page=${p}${status ? `&status=${status}` : ''}`}
                className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm transition-colors ${
                  p === page
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {p}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const club = await getClubDisplayData(slug)

  if (!club) return { title: 'Club Not Found' }

  return {
    title: `Events | ${club.title} | GCET Clubs`,
    description: `Events and activities organized by ${club.title} at GCET.`,
  }
}
