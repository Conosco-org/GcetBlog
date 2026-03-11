import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { ClubDisplayData } from '../types'

interface ClubSubPageHeaderProps {
  club: ClubDisplayData
  title: string
  description?: string
}

/**
 * Compact header used on club sub-pages (events, team, achievements).
 * Shows club logo, name, and a back-link to the club overview.
 */
export const ClubSubPageHeader: React.FC<ClubSubPageHeaderProps> = ({
  club,
  title,
  description,
}) => {
  const logoUrl = club.logoUrl || club.conoscoLogoUrl

  return (
    <div className="bg-card border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 py-6 md:py-8">
        <Link
          href={`/clubs/${club.slug}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to {club.title}
        </Link>

        <div className="flex items-center gap-4">
          {logoUrl && (
            <div className="shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden border border-border bg-background">
              <Image
                src={logoUrl}
                alt={`${club.title} logo`}
                width={56}
                height={56}
                className="object-cover w-full h-full"
              />
            </div>
          )}
          <div>
            <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-bold leading-tight text-foreground">
              {title}
            </h1>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
