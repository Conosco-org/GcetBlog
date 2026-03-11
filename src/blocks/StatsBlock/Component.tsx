import React from 'react'
import { Users2, Calendar, Trophy, Star, Target, Zap } from 'lucide-react'

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  users: Users2,
  calendar: Calendar,
  trophy: Trophy,
  star: Star,
  target: Target,
  zap: Zap,
}

interface StatItem {
  label: string
  value: string
  icon?: string
  description?: string
}

interface StatsBlockProps {
  heading?: string | null
  layout?: 'grid' | 'strip' | null
  stats: StatItem[]
}

export const StatsBlockComponent: React.FC<StatsBlockProps> = ({
  heading,
  layout = 'grid',
  stats,
}) => {
  if (!stats || stats.length === 0) return null

  if (layout === 'strip') {
    return (
      <div className="container">
        {heading && (
          <h2 className="text-2xl font-display font-bold mb-6 text-center">{heading}</h2>
        )}
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 py-6 px-4 rounded-xl bg-accent/5 border border-border">
          {stats.map((stat, i) => {
            const Icon = stat.icon ? iconMap[stat.icon] : null
            return (
              <div key={i} className="text-center">
                {Icon && <Icon className="h-5 w-5 mx-auto mb-1 text-[var(--club-primary,hsl(var(--accent)))]" />}
                <p className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      {heading && (
        <h2 className="text-2xl font-display font-bold mb-6">{heading}</h2>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon ? iconMap[stat.icon] : null
          return (
            <div
              key={i}
              className="club-card rounded-xl border border-border bg-card p-5 text-center"
            >
              {Icon && (
                <Icon className="h-6 w-6 mx-auto mb-2 text-[var(--club-primary,hsl(var(--accent)))]" />
              )}
              <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm font-medium text-muted-foreground mt-1">{stat.label}</p>
              {stat.description && (
                <p className="text-xs text-muted-foreground/70 mt-0.5">{stat.description}</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
