/**
 * Unsubscribe Confirmation Email
 *
 * Sent after a subscriber unsubscribes. Provides resubscribe link.
 */

import { Button, Heading, Section, Text } from '@react-email/components'
import * as React from 'react'
import { BaseLayout } from './BaseLayout'

interface UnsubscribeConfirmationProps {
  subscriberName?: string
  resubscribeUrl: string
  baseUrl?: string
}

export function UnsubscribeConfirmation({
  subscriberName,
  resubscribeUrl,
  baseUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? 'https://blog.gcet.edu.in',
}: UnsubscribeConfirmationProps) {
  const greeting = subscriberName ? `Hi ${subscriberName}` : 'Hi'

  return (
    <BaseLayout preview="You've been unsubscribed from the GCET Blog" baseUrl={baseUrl}>
      <Heading style={heading}>You&apos;ve been unsubscribed</Heading>

      <Text style={bodyText}>
        {greeting}, you&apos;ve been successfully removed from the GCET Blog mailing list.
        You won&apos;t receive any more digest emails from us.
      </Text>

      <Text style={bodyText}>We&apos;re sorry to see you go! 😢</Text>

      <Text style={bodyText}>
        If this was a mistake, or if you change your mind, you can resubscribe anytime:
      </Text>

      <Section style={ctaSection}>
        <Button href={resubscribeUrl} style={ctaButton}>
          Resubscribe
        </Button>
      </Section>

      <Text style={smallText}>
        You can always visit{' '}
        <a href={baseUrl} style={linkStyle}>
          GCET Blog
        </a>{' '}
        directly to stay updated.
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

const ctaSection: React.CSSProperties = {
  textAlign: 'center' as const,
  padding: '8px 0 24px',
}

const ctaButton: React.CSSProperties = {
  backgroundColor: '#3b82f6',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 600,
  padding: '12px 24px',
  borderRadius: '6px',
  textDecoration: 'none',
}

const smallText: React.CSSProperties = {
  fontSize: '13px',
  color: '#6b7280',
  lineHeight: '20px',
  margin: 0,
}

const linkStyle: React.CSSProperties = {
  color: '#3b82f6',
  textDecoration: 'underline',
}
