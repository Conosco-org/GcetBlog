/**
 * Manual Newsletter Template
 *
 * Renders editor-composed rich content as a branded email.
 * The content HTML is passed in pre-rendered from Lexical rich text.
 */

import { Heading, Section, Text } from '@react-email/components'
import * as React from 'react'
import { BaseLayout } from './base-layout'

interface NewsletterManualProps {
  subscriberName?: string
  subject: string
  /** Pre-rendered HTML content from Lexical editor */
  contentHtml: string
  baseUrl?: string
  unsubscribeUrl: string
  preferencesUrl: string
}

export function NewsletterManual({
  subscriberName,
  subject,
  contentHtml,
  baseUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? 'https://blog.gcet.edu.in',
  unsubscribeUrl,
  preferencesUrl,
}: NewsletterManualProps) {
  const greeting = subscriberName ? `Hi ${subscriberName},` : 'Hi there,'

  return (
    <BaseLayout
      preview={subject}
      unsubscribeUrl={unsubscribeUrl}
      preferencesUrl={preferencesUrl}
      baseUrl={baseUrl}
    >
      <Heading style={heading}>{subject}</Heading>
      <Text style={greetingText}>{greeting}</Text>

      {/* Rendered rich text content from Lexical editor */}
      <Section style={contentSection}>
        <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
      </Section>
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
  margin: '0 0 8px',
}

const greetingText: React.CSSProperties = {
  fontSize: '15px',
  color: '#374151',
  lineHeight: '24px',
  margin: '0 0 16px',
}

const contentSection: React.CSSProperties = {
  fontSize: '15px',
  color: '#374151',
  lineHeight: '26px',
}
