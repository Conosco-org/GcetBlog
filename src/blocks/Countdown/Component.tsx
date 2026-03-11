'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { Timer } from 'lucide-react'
import { CMSLink } from '@/components/Link'

interface CountdownBlockProps {
  eventTitle: string
  targetDate: string
  description?: string | null
  links?: Array<{ link: Record<string, unknown> }> | null
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function calculateTimeLeft(target: Date): TimeLeft | null {
  const diff = target.getTime() - Date.now()
  if (diff <= 0) return null

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

export const CountdownBlockComponent: React.FC<CountdownBlockProps> = ({
  eventTitle,
  targetDate,
  description,
  links,
}) => {
  const target = useMemo(() => new Date(targetDate), [targetDate])
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(calculateTimeLeft(target))

  useEffect(() => {
    const interval = setInterval(() => {
      const tl = calculateTimeLeft(target)
      setTimeLeft(tl)
      if (!tl) clearInterval(interval)
    }, 1000)
    return () => clearInterval(interval)
  }, [target])

  const units: Array<{ key: keyof TimeLeft; label: string }> = [
    { key: 'days', label: 'Days' },
    { key: 'hours', label: 'Hours' },
    { key: 'minutes', label: 'Minutes' },
    { key: 'seconds', label: 'Seconds' },
  ]

  return (
    <div className="container">
      <div className="rounded-2xl border border-border bg-gradient-to-br from-card to-accent/5 p-8 md:p-12 text-center">
        <Timer className="h-8 w-8 mx-auto mb-3 text-[var(--club-primary,hsl(var(--accent)))]" />
        <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
          {eventTitle}
        </h2>
        {description && (
          <p className="text-muted-foreground text-sm max-w-lg mx-auto mb-6">{description}</p>
        )}

        {timeLeft ? (
          <div className="flex items-center justify-center gap-4 md:gap-6 my-6">
            {units.map(({ key, label }) => (
              <div key={key} className="text-center">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-background border border-border flex items-center justify-center">
                  <span className="text-2xl md:text-3xl font-bold tabular-nums text-foreground">
                    {String(timeLeft[key]).padStart(2, '0')}
                  </span>
                </div>
                <p className="text-[10px] md:text-xs text-muted-foreground mt-1.5 uppercase tracking-wider font-medium">
                  {label}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-accent font-semibold text-lg my-6">The event has started!</p>
        )}

        {links && links.length > 0 && (
          <div className="mt-4">
            {links.map(({ link }, i) => (
              <CMSLink key={i} {...link} appearance="default" />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
