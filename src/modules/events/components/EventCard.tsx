'use client'

import { cn } from '@/utilities/ui'
import Link from 'next/link'
import React from 'react'
import { Calendar, MapPin, Users, Clock } from 'lucide-react'
import type { EventCardData } from '../types'

function formatDate(dateStr?: string): string {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'upcoming':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
    case 'ongoing':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    case 'completed':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    case 'cancelled':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

export const EventCard: React.FC<{
  event: EventCardData
  className?: string
}> = ({ event, className }) => {
  const href = `/events/${event.slug}`
  const imageUrl = event.heroImageUrl ?? event.posterUrl

  return (
    <Link href={href} className="block">
      <article
        className={cn(
          'group relative overflow-hidden rounded-2xl border border-border bg-card hover:shadow-lg transition-all duration-300',
          className,
        )}
      >
        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={event.title}
              className="object-cover w-full h-full group-hover:scale-[1.03] transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/15 to-purple-500/10 flex items-center justify-center">
              <Calendar className="h-12 w-12 text-blue-500/30" />
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <span
              className={cn(
                'px-2.5 py-1 text-[10px] sm:text-xs font-medium tracking-wider uppercase rounded-full backdrop-blur-sm',
                getStatusColor(event.status),
              )}
            >
              {event.status}
            </span>
          </div>

          {/* Featured Badge */}
          {event.featured && (
            <div className="absolute top-3 right-3">
              <span className="px-2 py-1 bg-amber-400/90 text-amber-900 text-[10px] font-bold uppercase rounded-full">
                Featured
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5">
          {/* Event Type */}
          {event.eventType && (
            <div className="text-[10px] sm:text-xs tracking-wider uppercase text-accent font-medium mb-2">
              {event.eventType.replace('-', ' ')}
            </div>
          )}

          {/* Title */}
          <h3 className="text-base sm:text-lg font-semibold text-foreground line-clamp-2 mb-3 group-hover:text-accent transition-colors">
            {event.title}
          </h3>

          {/* Meta info */}
          <div className="flex flex-col gap-1.5 text-xs sm:text-sm text-muted-foreground">
            {event.startDate && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 shrink-0" />
                <span>
                  {formatDate(event.startDate)}
                  {event.endDate && event.endDate !== event.startDate && ` — ${formatDate(event.endDate)}`}
                </span>
              </div>
            )}
            {event.venue && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{event.venue.name}</span>
              </div>
            )}
            {event.registeredCount !== undefined && event.registeredCount > 0 && (
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 shrink-0" />
                <span>{event.registeredCount} registered</span>
              </div>
            )}
          </div>

          {/* Department tag */}
          {event.department && (
            <div className="mt-3">
              <span className="text-[10px] px-2 py-0.5 bg-muted rounded-full text-muted-foreground font-medium">
                {event.department}
              </span>
            </div>
          )}
        </div>
      </article>
    </Link>
  )
}
