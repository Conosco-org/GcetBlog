import React from 'react'
import { Quote, User } from 'lucide-react'

interface Testimonial {
  quote: string
  author: string
  role?: string | null
  image?: string | { url?: string; alt?: string } | null
}

interface TestimonialsBlockProps {
  heading?: string | null
  layout?: 'grid' | 'highlight' | null
  testimonials?: Testimonial[] | null
}

export const TestimonialsBlockComponent: React.FC<TestimonialsBlockProps> = ({
  heading = 'What Our Members Say',
  layout = 'grid',
  testimonials,
}) => {
  if (!testimonials || testimonials.length === 0) return null

  const getImageUrl = (image: Testimonial['image']): string | null => {
    if (!image) return null
    if (typeof image === 'string') return image
    return image.url || null
  }

  if (layout === 'highlight' && testimonials.length > 0) {
    const featured = testimonials[0]
    const imgUrl = getImageUrl(featured.image)

    return (
      <div className="container">
        {heading && <h2 className="text-2xl font-display font-bold mb-6 text-center">{heading}</h2>}
        <div className="max-w-2xl mx-auto text-center">
          <Quote className="h-10 w-10 mx-auto mb-4 text-[var(--club-primary,hsl(var(--accent)))] opacity-30" />
          <blockquote className="text-lg md:text-xl italic text-foreground leading-relaxed mb-6">
            &ldquo;{featured.quote}&rdquo;
          </blockquote>
          <div className="flex items-center justify-center gap-3">
            {imgUrl ? (
              <img
                src={imgUrl}
                alt={featured.author}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <User className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            <div className="text-left">
              <p className="font-semibold text-foreground">{featured.author}</p>
              {featured.role && (
                <p className="text-sm text-muted-foreground">{featured.role}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Grid layout (default)
  return (
    <div className="container">
      {heading && <h2 className="text-2xl font-display font-bold mb-6">{heading}</h2>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {testimonials.map((t, i) => {
          const imgUrl = getImageUrl(t.image)
          return (
            <div
              key={i}
              className="club-card rounded-xl border border-border bg-card p-6"
            >
              <Quote className="h-5 w-5 mb-3 text-[var(--club-primary,hsl(var(--accent)))] opacity-30" />
              <blockquote className="text-sm text-foreground italic leading-relaxed mb-4">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div className="flex items-center gap-3 pt-3 border-t border-border">
                {imgUrl ? (
                  <img
                    src={imgUrl}
                    alt={t.author}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-foreground">{t.author}</p>
                  {t.role && (
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
