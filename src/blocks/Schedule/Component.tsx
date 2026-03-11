import React from 'react'
import { Clock, MapPin, Mic2, Wrench, Users2, Coffee, Handshake } from 'lucide-react'

interface Session {
  time: string
  title: string
  speaker?: string | null
  venue?: string | null
  type?: 'talk' | 'workshop' | 'panel' | 'break' | 'networking' | null
}

interface Day {
  date: string
  title?: string | null
  sessions?: Session[] | null
}

interface ScheduleBlockProps {
  heading?: string | null
  days?: Day[] | null
}

const typeConfig: Record<string, { icon: React.FC<{ className?: string }>; color: string }> = {
  talk: { icon: Mic2, color: 'text-blue-500' },
  workshop: { icon: Wrench, color: 'text-purple-500' },
  panel: { icon: Users2, color: 'text-emerald-500' },
  break: { icon: Coffee, color: 'text-amber-500' },
  networking: { icon: Handshake, color: 'text-pink-500' },
}

export const ScheduleBlockComponent: React.FC<ScheduleBlockProps> = ({
  heading = 'Event Schedule',
  days,
}) => {
  if (!days || days.length === 0) return null

  return (
    <div className="container">
      {heading && <h2 className="text-2xl font-display font-bold mb-6">{heading}</h2>}
      <div className="space-y-8">
        {days.map((day, dayIdx) => (
          <div key={dayIdx}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[var(--club-primary,hsl(var(--accent)))]/10 flex items-center justify-center">
                <span className="text-sm font-bold text-[var(--club-primary,hsl(var(--accent)))]">
                  {dayIdx + 1}
                </span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  {new Date(day.date).toLocaleDateString('en-IN', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
                {day.title && (
                  <p className="font-semibold text-foreground">{day.title}</p>
                )}
              </div>
            </div>

            <div className="space-y-2 ml-5 border-l-2 border-border pl-6">
              {day.sessions?.map((session, sIdx) => {
                const config = typeConfig[session.type || 'talk']
                const TypeIcon = config?.icon || Mic2
                const iconColor = config?.color || 'text-muted-foreground'

                return (
                  <div
                    key={sIdx}
                    className="club-card relative rounded-lg border border-border bg-card p-4"
                  >
                    <div className="absolute -left-[31px] top-4 w-3 h-3 rounded-full bg-background border-2 border-[var(--club-primary,hsl(var(--accent)))]" />
                    <div className="flex items-start gap-3">
                      <TypeIcon className={`h-4 w-4 mt-0.5 shrink-0 ${iconColor}`} />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-sm text-foreground">{session.title}</h4>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {session.time}
                          </span>
                          {session.speaker && (
                            <span className="flex items-center gap-1">
                              <Mic2 className="h-3 w-3" />
                              {session.speaker}
                            </span>
                          )}
                          {session.venue && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {session.venue}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={`text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full bg-muted ${iconColor}`}>
                        {session.type || 'talk'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
