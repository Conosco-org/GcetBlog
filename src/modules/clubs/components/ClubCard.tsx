'use client'

import { cn } from '@/utilities/ui'
import Link from 'next/link'
import React from 'react'
import { Users2, Globe, Landmark } from 'lucide-react'
import type { ClubCardData } from '../types'

function getClassificationColor(classification?: string): string {
  switch (classification) {
    case 'technical':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
    case 'cultural':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
    case 'sports':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    case 'social':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
    case 'professional':
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

export const ClubCard: React.FC<{
  club: ClubCardData
  className?: string
}> = ({ club, className }) => {
  const href = `/clubs/${club.slug}`
  const imageUrl = club.heroImageUrl ?? club.logoUrl

  return (
    <Link href={href} className="block">
      <article
        className={cn(
          'group relative overflow-hidden rounded-2xl border border-border bg-card hover:shadow-lg transition-all duration-300',
          className,
        )}
      >
        {/* Image / Logo */}
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={club.title}
              className="object-cover w-full h-full group-hover:scale-[1.03] transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/15 to-purple-500/10 flex items-center justify-center">
              <Landmark className="h-12 w-12 text-indigo-500/30" />
            </div>
          )}

          {/* Classification Badge */}
          {club.classification && (
            <div className="absolute top-3 left-3">
              <span
                className={cn(
                  'px-2.5 py-1 text-[10px] sm:text-xs font-medium tracking-wider uppercase rounded-full backdrop-blur-sm',
                  getClassificationColor(club.classification),
                )}
              >
                {club.classification}
              </span>
            </div>
          )}

          {/* Featured Badge */}
          {club.featured && (
            <div className="absolute top-3 right-3">
              <span className="px-2 py-1 bg-amber-400/90 text-amber-900 text-[10px] font-bold uppercase rounded-full">
                Featured
              </span>
            </div>
          )}

          {/* Status indicator */}
          {club.status === 'inactive' && (
            <div className="absolute bottom-3 right-3">
              <span className="px-2 py-1 bg-gray-800/70 text-gray-200 text-[10px] uppercase rounded-full">
                Inactive
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5">
          {/* Title */}
          <h3 className="text-base sm:text-lg font-semibold text-foreground line-clamp-2 mb-3 group-hover:text-accent transition-colors">
            {club.title}
          </h3>

          {/* Meta info */}
          <div className="flex flex-col gap-1.5 text-xs sm:text-sm text-muted-foreground">
            {club.memberCount !== undefined && club.memberCount > 0 && (
              <div className="flex items-center gap-1.5">
                <Users2 className="h-3.5 w-3.5 shrink-0" />
                <span>{club.memberCount} members</span>
              </div>
            )}
            {club.department && (
              <div className="flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 shrink-0" />
                <span>{club.department}</span>
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}
