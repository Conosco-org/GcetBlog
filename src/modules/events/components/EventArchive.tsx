import React from 'react'
import type { EventCardData } from '../types'
import { EventCard } from './EventCard'

export const EventArchive: React.FC<{
  events: EventCardData[]
}> = ({ events }) => {
  if (!events || events.length === 0) return null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event, index) => (
        <EventCard key={event.slug || index} event={event} />
      ))}
    </div>
  )
}
