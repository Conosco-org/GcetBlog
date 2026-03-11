import React from 'react'
import { cn } from '@/utilities/ui'

interface ClubTheme {
  primaryColor?: string
  accentColor?: string
  cardStyle?: string
  fontPreset?: string
}

interface ClubThemeWrapperProps {
  theme?: ClubTheme
  children: React.ReactNode
  className?: string
}

/**
 * Wraps club content and injects CSS custom properties for per-club theming.
 *
 * Theme tokens available via CSS:
 * --club-primary, --club-accent
 *
 * Card style classes: club-card-default, club-card-glass, club-card-bordered, club-card-elevated
 * Font preset classes: club-font-default, club-font-modern, club-font-classic, club-font-technical
 */
export const ClubThemeWrapper: React.FC<ClubThemeWrapperProps> = ({
  theme,
  children,
  className,
}) => {
  const primaryColor = theme?.primaryColor || '#0047AB'
  const accentColor = theme?.accentColor || '#3B82F6'
  const cardStyle = theme?.cardStyle || 'default'
  const fontPreset = theme?.fontPreset || 'default'

  return (
    <div
      style={
        {
          '--club-primary': primaryColor,
          '--club-accent': accentColor,
        } as React.CSSProperties
      }
      className={cn(
        'club-theme',
        `club-card-${cardStyle}`,
        `club-font-${fontPreset}`,
        className,
      )}
    >
      {children}
    </div>
  )
}
