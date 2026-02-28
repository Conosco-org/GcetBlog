/**
 * Welcome Email - Sent on new subscription for double opt-in confirmation.
 */

import { Button, Heading, Section, Text } from '@react-email/components'
import * as React from 'react'
import { BaseLayout } from './BaseLayout'

interface WelcomeEmailProps {
  subscriberName?: string
  confirmUrl: string
  preferencesUrl: string
  baseUrl?: string
}

export function WelcomeEmail({
  subscriberName,
  confirmUrl,
  preferencesUrl,
  baseUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? 'https://blog.gcet.edu.in',
}: WelcomeEmailProps) {
  const greeting = subscriberName ? `Hi ${subscriberName}` : 'Hi there'

  return (
    <BaseLayout
      preview="Confirm your subscription to the GCET Blog newsletter"
      preferencesUrl={preferencesUrl}
      baseUrl={baseUrl}
    >
      <Heading style={heading}>Welcome to the GCET Blog! 🎉</Heading>

      <Text style={bodyText}>
        {greeting}, thanks for subscribing to the GCET Blog newsletter!
      </Text>

      <Text style={bodyText}>
        Please confirm your email address by clicking the button below.
        This helps us ensure you actually want to receive our emails.
      </Text>

      <Section style={ctaSection}>
        <Button href={confirmUrl} style={ctaButton}>
          Confirm My Subscription
        </Button>
      </Section>

      <Text style={bodyText}>
        Once confirmed, you&apos;ll receive:
      </Text>

      <Text style={listText}>
        📝 Curated digests of the latest posts
        <br />
        🎯 Content tailored to your category preferences
        <br />
        📢 Important announcements and campus updates
      </Text>

      <Text style={smallText}>
        You can{' '}
        <a href={preferencesUrl} style={linkStyle}>
          manage your preferences
        </a>{' '}
        at any time - choose your categories and digest frequency.
      </Text>

      <Text style={smallText}>
        If you didn&apos;t subscribe, you can safely ignore this email.
        This link expires in 48 hours.
      </Text>
    </BaseLayout>
  )
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const heading: React.CSSProperties = {
  fontSize: '22px',
  fontWeight: 700,
  color: '#111827',
  margin: '0 0 16px',
}

const bodyText: React.CSSProperties = {
  fontSize: '15px',
  color: '#374151',
  lineHeight: '24px',
  margin: '0 0 16px',
}

const listText: React.CSSProperties = {
  fontSize: '15px',
  color: '#374151',
  lineHeight: '28px',
  margin: '0 0 16px',
  paddingLeft: '8px',
}

const ctaSection: React.CSSProperties = {
  textAlign: 'center' as const,
  padding: '8px 0 24px',
}

const ctaButton: React.CSSProperties = {
  backgroundColor: '#16a34a',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 600,
  padding: '14px 32px',
  borderRadius: '8px',
  textDecoration: 'none',
}

const smallText: React.CSSProperties = {
  fontSize: '13px',
  color: '#6b7280',
  lineHeight: '20px',
  margin: '0 0 8px',
}

const linkStyle: React.CSSProperties = {
  color: '#3b82f6',
  textDecoration: 'underline',
}
