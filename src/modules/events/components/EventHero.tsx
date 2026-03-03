import React from 'react'
import { Calendar, MapPin, Users, Clock, ExternalLink, Award, Globe } from 'lucide-react'
import type { EventDisplayData } from '../types'

function formatDateTime(dateStr?: string): string {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

function getStatusStyle(status: string): string {
  switch (status) {
    case 'upcoming':
      return 'bg-blue-500 text-white'
    case 'ongoing':
      return 'bg-green-500 text-white'
    case 'completed':
      return 'bg-gray-500 text-white'
    case 'cancelled':
      return 'bg-red-500 text-white'
    default:
      return 'bg-gray-500 text-white'
  }
}

export const EventHero: React.FC<{
  event: EventDisplayData
}> = ({ event }) => {
  const imageUrl = event.heroImageUrl ?? event.posterUrl

  return (
    <div className="relative">
      {/* Hero Image */}
      <div className="relative h-[40vh] sm:h-[50vh] min-h-[320px] max-h-[600px] overflow-hidden bg-muted">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={event.title}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-700" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
          <div className="container mx-auto max-w-4xl">
            {/* Status + Type badges */}
            <div className="flex items-center gap-2 mb-4">
              <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full ${getStatusStyle(event.status)}`}>
                {event.status}
              </span>
              {event.eventType && (
                <span className="px-3 py-1 text-xs font-medium uppercase rounded-full bg-white/20 text-white backdrop-blur-sm">
                  {event.eventType.replace('-', ' ')}
                </span>
              )}
              {event.dataSource === 'conosco' && (
                <span className="px-2 py-1 text-[10px] font-medium rounded-full bg-blue-500/20 text-blue-200 backdrop-blur-sm">
                  Conosco Verified
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              {event.title}
            </h1>

            {/* Key info row */}
            <div className="flex flex-wrap gap-4 text-sm text-white/80">
              {event.startDate && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDateTime(event.startDate)}</span>
                </div>
              )}
              {event.venue && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  <span>{event.venue.name}</span>
                  {event.venue.type !== 'physical' && (
                    <span className="text-xs bg-white/15 px-1.5 py-0.5 rounded">
                      {event.venue.type}
                    </span>
                  )}
                </div>
              )}
              {event.organizer && (
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  <span>by {event.organizer.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * EventEnrichment — Sidebar enrichment panel showing Conosco data
 * Doctrine Rule 3: Display operational truth without overriding
 */
export const EventEnrichment: React.FC<{
  event: EventDisplayData
}> = ({ event }) => {
  const hasRegistration = event.registration
  const hasCompletion = event.completion

  return (
    <div className="space-y-6">
      {/* Registration Info */}
      {hasRegistration && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Registration
          </h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Status</span>
              <span className={event.registration!.isOpen ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                {event.registration!.isOpen ? 'Open' : 'Closed'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Registered</span>
              <span className="font-medium text-foreground">{event.registration!.registeredCount}</span>
            </div>
            {event.registration!.maxParticipants && (
              <div className="flex justify-between">
                <span>Capacity</span>
                <span>{event.registration!.maxParticipants}</span>
              </div>
            )}
            {event.registrationDeadline && (
              <div className="flex justify-between">
                <span>Deadline</span>
                <span>{formatDateTime(event.registrationDeadline)}</span>
              </div>
            )}
          </div>
          {event.registration!.isOpen && event.registration!.registrationUrl && (
            <a
              href={event.registration!.registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-accent text-accent-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
            >
              Register Now
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      )}

      {/* Completion Stats */}
      {hasCompletion && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Award className="h-4 w-4" />
            Event Results
          </h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Attendees</span>
              <span className="font-medium text-foreground">{event.completion!.attendeeCount}</span>
            </div>
            {event.completion!.feedbackRating && (
              <div className="flex justify-between">
                <span>Rating</span>
                <span className="font-medium text-foreground">
                  {event.completion!.feedbackRating.toFixed(1)} / 5
                </span>
              </div>
            )}
            {event.completion!.certificateAvailable && event.completion!.certificateVerificationUrl && (
              <a
                href={event.completion!.certificateVerificationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-accent hover:underline mt-2"
              >
                <Globe className="h-3.5 w-3.5" />
                Verify Certificate
              </a>
            )}
          </div>
        </div>
      )}

      {/* Date Details */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Schedule
        </h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          {event.startDate && (
            <div>
              <span className="text-xs uppercase tracking-wider text-muted-foreground/70">Starts</span>
              <p className="text-foreground">{formatDateTime(event.startDate)}</p>
            </div>
          )}
          {event.endDate && (
            <div>
              <span className="text-xs uppercase tracking-wider text-muted-foreground/70">Ends</span>
              <p className="text-foreground">{formatDateTime(event.endDate)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Department & Tags */}
      {(event.department || (event.tags && event.tags.length > 0)) && (
        <div className="rounded-xl border border-border bg-card p-5">
          {event.department && (
            <div className="mb-3">
              <span className="text-xs uppercase tracking-wider text-muted-foreground/70">Department</span>
              <p className="text-sm font-medium text-foreground">{event.department}</p>
            </div>
          )}
          {event.tags && event.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {event.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
