import React from 'react'
import { User, Mail, Linkedin } from 'lucide-react'

interface TeamMember {
  name: string
  role: string
  image?: string | { url?: string } | null
  email?: string | null
  linkedIn?: string | null
}

interface TeamGridBlockProps {
  heading?: string | null
  source?: 'manual' | 'conosco' | null
  layout?: 'grid' | 'compact' | null
  members?: TeamMember[] | null
}

export const TeamGridBlockComponent: React.FC<TeamGridBlockProps> = ({
  heading = 'Our Team',
  layout = 'grid',
  members,
}) => {
  if (!members || members.length === 0) {
    return (
      <div className="container">
        {heading && <h2 className="text-2xl font-display font-bold mb-4">{heading}</h2>}
        <p className="text-muted-foreground text-sm">No team members added yet.</p>
      </div>
    )
  }

  const getImageUrl = (image: TeamMember['image']): string | null => {
    if (!image) return null
    if (typeof image === 'string') return image
    return image.url || null
  }

  if (layout === 'compact') {
    return (
      <div className="container">
        {heading && <h2 className="text-2xl font-display font-bold mb-6">{heading}</h2>}
        <div className="space-y-3">
          {members.map((member, i) => {
            const imgUrl = getImageUrl(member.image)
            return (
              <div
                key={i}
                className="flex items-center gap-4 rounded-lg border border-border bg-card p-3 club-card"
              >
                {imgUrl ? (
                  <img
                    src={imgUrl}
                    alt={member.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm text-foreground truncate">{member.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{member.role}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {member.email && (
                    <a href={`mailto:${member.email}`} className="text-muted-foreground hover:text-accent" aria-label={`Email ${member.name}`}>
                      <Mail className="h-4 w-4" />
                    </a>
                  )}
                  {member.linkedIn && (
                    <a href={member.linkedIn} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-accent" aria-label={`${member.name}'s LinkedIn`}>
                      <Linkedin className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Grid layout (default)
  return (
    <div className="container">
      {heading && <h2 className="text-2xl font-display font-bold mb-6">{heading}</h2>}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {members.map((member, i) => {
          const imgUrl = getImageUrl(member.image)
          return (
            <div
              key={i}
              className="club-card rounded-xl border border-border bg-card p-5 text-center"
            >
              {imgUrl ? (
                <img
                  src={imgUrl}
                  alt={member.name}
                  className="w-20 h-20 rounded-full object-cover mx-auto mb-3"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
                  <User className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <h3 className="font-semibold text-sm text-foreground">{member.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{member.role}</p>
              <div className="flex items-center justify-center gap-2 mt-3">
                {member.email && (
                  <a href={`mailto:${member.email}`} className="text-muted-foreground hover:text-accent" aria-label={`Email ${member.name}`}>
                    <Mail className="h-4 w-4" />
                  </a>
                )}
                {member.linkedIn && (
                  <a href={member.linkedIn} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-accent" aria-label={`${member.name}'s LinkedIn`}>
                    <Linkedin className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
