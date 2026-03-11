import React from 'react'
import Link from 'next/link'
import { Calendar, MapPin, ArrowRight } from 'lucide-react'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import type { Where } from 'payload'

interface EventsFeedBlockProps {
  heading?: string | null
  club?: string | { id: string } | null
  limit?: number | null
  layout?: 'cards' | 'timeline' | null
  showStatus?: boolean | null
}

export const EventsFeedBlockComponent: React.FC<EventsFeedBlockProps> = async ({
  heading = 'Upcoming Events',
  club,
  limit = 6,
  layout = 'cards',
  showStatus = true,
}) => {
  const payload = await getPayload({ config: configPromise })

  const clubId = typeof club === 'object' && club !== null ? club.id : club

  const where: Where = {
    _status: { equals: 'published' },
  }

  if (clubId) {
    where.or = [
      { createdByClub: { equals: clubId } },
      { organizingClubs: { contains: clubId } },
    ]
  }

  const result = await payload.find({
    collection: 'events',
    where,
    limit: limit || 6,
    sort: '-startDate',
    depth: 0,
  })

  const events = result.docs

  if (!events || events.length === 0) {
    return (
      <div className="container">
        {heading && <h2 className="text-2xl font-display font-bold mb-4">{heading}</h2>}
        <p className="text-muted-foreground text-sm">No events to display.</p>
      </div>
    )
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
      case 'ongoing':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
      case 'completed':
        return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
      case 'cancelled':
        return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  if (layout === 'timeline') {
    return (
      <div className="container">
        {heading && <h2 className="text-2xl font-display font-bold mb-6">{heading}</h2>}
        <div className="relative border-l-2 border-border ml-4 space-y-6">
          {events.map((event) => (
            <div key={event.id} className="relative pl-8">
              <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-[var(--club-primary,hsl(var(--accent)))] bg-background" />
              <Link href={`/events/${event.slug}`} className="block group">
                <div className="club-card rounded-xl border border-border bg-card p-4 hover:border-accent/30 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors truncate">
                        {event.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted-foreground">
                        {event.startDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(event.startDate).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        )}
                        {event.venue && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.venue}
                          </span>
                        )}
                      </div>
                    </div>
                    {showStatus && event.manualStatus && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${getStatusColor(event.manualStatus)}`}>
                        {event.manualStatus}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Cards grid layout (default)
  return (
    <div className="container">
      {heading && <h2 className="text-2xl font-display font-bold mb-6">{heading}</h2>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event) => (
          <Link
            key={event.id}
            href={`/events/${event.slug}`}
            className="group club-card rounded-xl border border-border bg-card p-5 hover:border-accent/30 transition-colors"
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-2">
                {event.title}
              </h3>
              {showStatus && event.manualStatus && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${getStatusColor(event.manualStatus)}`}>
                  {event.manualStatus}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {event.startDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(event.startDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              )}
              {event.venue && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {event.venue}
                </span>
              )}
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs font-medium text-accent opacity-0 group-hover:opacity-100 transition-opacity">
              View details <ArrowRight className="h-3 w-3" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
