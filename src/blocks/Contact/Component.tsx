import React from 'react'
import { MapPin, Mail, Phone, Instagram, Linkedin, Twitter, Github, Youtube, Globe } from 'lucide-react'

interface SocialLink {
  platform: 'instagram' | 'linkedin' | 'twitter' | 'github' | 'youtube' | 'website'
  url: string
}

interface ContactBlockProps {
  heading?: string | null
  address?: string | null
  email?: string | null
  phone?: string | null
  socialLinks?: SocialLink[] | null
  mapEmbedUrl?: string | null
}

const platformIcons: Record<string, React.FC<{ className?: string }>> = {
  instagram: Instagram,
  linkedin: Linkedin,
  twitter: Twitter,
  github: Github,
  youtube: Youtube,
  website: Globe,
}

const platformLabels: Record<string, string> = {
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  twitter: 'Twitter / X',
  github: 'GitHub',
  youtube: 'YouTube',
  website: 'Website',
}

export const ContactBlockComponent: React.FC<ContactBlockProps> = ({
  heading = 'Get in Touch',
  address,
  email,
  phone,
  socialLinks,
  mapEmbedUrl,
}) => {
  const hasInfo = address || email || phone || (socialLinks && socialLinks.length > 0)
  if (!hasInfo && !mapEmbedUrl) return null

  return (
    <div className="container">
      {heading && <h2 className="text-2xl font-display font-bold mb-6">{heading}</h2>}
      <div className={`grid gap-6 ${mapEmbedUrl ? 'md:grid-cols-2' : 'md:grid-cols-1 max-w-xl'}`}>
        {/* Contact info */}
        {hasInfo && (
          <div className="club-card rounded-xl border border-border bg-card p-6 space-y-5">
            {address && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 mt-0.5 shrink-0 text-[var(--club-primary,hsl(var(--accent)))]" />
                <div>
                  <p className="text-sm font-medium text-foreground mb-0.5">Address</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{address}</p>
                </div>
              </div>
            )}
            {email && (
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 mt-0.5 shrink-0 text-[var(--club-primary,hsl(var(--accent)))]" />
                <div>
                  <p className="text-sm font-medium text-foreground mb-0.5">Email</p>
                  <a
                    href={`mailto:${email}`}
                    className="text-sm text-accent hover:underline"
                  >
                    {email}
                  </a>
                </div>
              </div>
            )}
            {phone && (
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 mt-0.5 shrink-0 text-[var(--club-primary,hsl(var(--accent)))]" />
                <div>
                  <p className="text-sm font-medium text-foreground mb-0.5">Phone</p>
                  <a
                    href={`tel:${phone}`}
                    className="text-sm text-accent hover:underline"
                  >
                    {phone}
                  </a>
                </div>
              </div>
            )}
            {socialLinks && socialLinks.length > 0 && (
              <div>
                <p className="text-sm font-medium text-foreground mb-3">Follow Us</p>
                <div className="flex flex-wrap gap-3">
                  {socialLinks.map((social, i) => {
                    const Icon = platformIcons[social.platform] || Globe
                    return (
                      <a
                        key={i}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-accent/5 transition-colors text-sm text-foreground"
                        aria-label={platformLabels[social.platform] || social.platform}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-xs">{platformLabels[social.platform] || social.platform}</span>
                      </a>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Map embed */}
        {mapEmbedUrl && (
          <div className="rounded-xl border border-border overflow-hidden aspect-video md:aspect-auto md:min-h-[300px]">
            <iframe
              src={mapEmbedUrl}
              className="w-full h-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              style={{ border: 0 }}
              title="Location map"
              allowFullScreen
            />
          </div>
        )}
      </div>
    </div>
  )
}
