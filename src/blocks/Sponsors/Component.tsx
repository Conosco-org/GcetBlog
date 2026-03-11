import React from 'react'

interface Sponsor {
  name: string
  logo?: string | { url?: string; alt?: string } | null
  url?: string | null
  tier?: 'gold' | 'silver' | 'bronze' | 'partner' | null
}

interface SponsorsBlockProps {
  heading?: string | null
  layout?: 'grid' | 'marquee' | null
  sponsors?: Sponsor[] | null
}

export const SponsorsBlockComponent: React.FC<SponsorsBlockProps> = ({
  heading = 'Our Partners & Sponsors',
  layout = 'grid',
  sponsors,
}) => {
  if (!sponsors || sponsors.length === 0) return null

  const getLogoUrl = (logo: Sponsor['logo']): string | null => {
    if (!logo) return null
    if (typeof logo === 'string') return logo
    return logo.url || null
  }

  const tierOrder = { gold: 0, silver: 1, bronze: 2, partner: 3 }
  const sorted = [...sponsors].sort(
    (a, b) => (tierOrder[a.tier || 'partner'] ?? 3) - (tierOrder[b.tier || 'partner'] ?? 3),
  )

  const tierColors: Record<string, string> = {
    gold: 'border-amber-400/50',
    silver: 'border-gray-400/50',
    bronze: 'border-orange-800/50',
    partner: 'border-border',
  }

  const SponsorLogo: React.FC<{ sponsor: Sponsor }> = ({ sponsor }) => {
    const logoUrl = getLogoUrl(sponsor.logo)
    if (!logoUrl) return null

    const content = (
      <div
        className={`club-card rounded-xl border-2 ${tierColors[sponsor.tier || 'partner']} bg-card p-4 flex items-center justify-center aspect-[3/2] hover:shadow-md transition-shadow`}
      >
        <img
          src={logoUrl}
          alt={sponsor.name}
          className="max-h-16 max-w-full object-contain"
          loading="lazy"
        />
      </div>
    )

    if (sponsor.url) {
      return (
        <a
          href={sponsor.url}
          target="_blank"
          rel="noopener noreferrer"
          title={sponsor.name}
        >
          {content}
        </a>
      )
    }
    return content
  }

  if (layout === 'marquee') {
    return (
      <div className="container">
        {heading && <h2 className="text-2xl font-display font-bold mb-6 text-center">{heading}</h2>}
        <div className="relative overflow-hidden py-4">
          <div className="flex animate-marquee gap-8">
            {[...sorted, ...sorted].map((sponsor, i) => (
              <div key={i} className="shrink-0 w-40">
                <SponsorLogo sponsor={sponsor} />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Grid layout (default)
  return (
    <div className="container">
      {heading && <h2 className="text-2xl font-display font-bold mb-6 text-center">{heading}</h2>}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {sorted.map((sponsor, i) => (
          <SponsorLogo key={i} sponsor={sponsor} />
        ))}
      </div>
    </div>
  )
}
