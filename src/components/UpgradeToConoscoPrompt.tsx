'use client'

import React from 'react'
import { ArrowUpCircle, Sparkles, BarChart3, Award, X } from 'lucide-react'
import { useState } from 'react'

interface UpgradeToConoscoPromptProps {
  dataSource: string
  className?: string
}

const benefits = [
  {
    icon: BarChart3,
    title: 'Attendance Tracking',
    description: 'Automatic attendance counts and analytics for your events',
  },
  {
    icon: Award,
    title: 'Certificate Generation',
    description: 'Auto-generate participation certificates for attendees',
  },
  {
    icon: Sparkles,
    title: 'Rich Insights',
    description: 'Engagement metrics, feedback collection, and reporting tools',
  },
]

export function UpgradeToConoscoPrompt({ dataSource, className = '' }: UpgradeToConoscoPromptProps) {
  const [dismissed, setDismissed] = useState(false)

  // Only show for manual or external events
  if (dataSource === 'conosco' || dismissed) return null

  return (
    <div
      className={`relative rounded-xl border border-accent/30 bg-gradient-to-br from-accent/5 to-accent/10 p-5 ${className}`}
    >
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Dismiss upgrade prompt"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-3 mb-4">
        <ArrowUpCircle className="h-6 w-6 text-accent shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-foreground text-sm">
            Upgrade to Conosco-Powered Event
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {dataSource === 'manual'
              ? 'Your event is currently managed manually. Link it to Conosco to unlock powerful features.'
              : 'This event uses an external platform. Connect with Conosco for unified management.'}
          </p>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {benefits.map((benefit, i) => {
          const Icon = benefit.icon
          return (
            <div key={i} className="flex items-start gap-2.5">
              <Icon className="h-4 w-4 text-accent shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-foreground">{benefit.title}</p>
                <p className="text-[11px] text-muted-foreground">{benefit.description}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex items-center gap-3">
        <p className="text-[11px] text-muted-foreground italic">
          Change the &quot;Data Source&quot; field above to &quot;From Conosco&quot; to connect this event.
        </p>
      </div>
    </div>
  )
}
