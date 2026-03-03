import React from 'react'
import type { ClubCardData } from '../types'
import { ClubCard } from './ClubCard'

export const ClubArchive: React.FC<{
  clubs: ClubCardData[]
}> = ({ clubs }) => {
  if (!clubs || clubs.length === 0) return null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {clubs.map((club, index) => (
        <ClubCard key={club.slug || index} club={club} />
      ))}
    </div>
  )
}
