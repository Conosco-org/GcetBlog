/**
 * Base Layout - Shared wrapper for all GCET Blog newsletter emails.
 *
 * Responsive (600px max), CAN-SPAM compliant footer,
 * consistent branding across all email types.
 */

import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Img,
} from '@react-email/components'
import * as React from 'react'

interface BaseLayoutProps {
  preview?: string
  children: React.ReactNode
  unsubscribeUrl?: string
  preferencesUrl?: string
  baseUrl?: string
}

export function BaseLayout({
  preview,
  children,
  unsubscribeUrl,
  preferencesUrl,
  baseUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? 'https://blog.gcet.edu.in',
}: BaseLayoutProps) {
  return (
    <Html>
      <Head>
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
      </Head>
      {preview && <Preview>{preview}</Preview>}
      <Body style={body}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Link href={baseUrl} style={{ textDecoration: 'none' }}>
              <Img
                src={`${baseUrl}/logo.png`}
                width="40"
                height="40"
                alt="GCET Blog"
                style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '12px' }}
              />
              <Text style={brandTitle}>GCET Blog</Text>
            </Link>
          </Section>

          <Hr style={divider} />

          {/* Content */}
          <Section style={content}>{children}</Section>

          <Hr style={divider} />

          {/* Footer - CAN-SPAM Compliant */}
          <Section style={footer}>
            <Text style={footerText}>
              You&apos;re receiving this because you subscribed to the GCET Blog newsletter.
            </Text>

            <Text style={footerLinks}>
              {unsubscribeUrl && (
                <>
                  <Link href={unsubscribeUrl} style={footerLink}>
                    Unsubscribe
                  </Link>
                  {' · '}
                </>
              )}
              {preferencesUrl && (
                <>
                  <Link href={preferencesUrl} style={footerLink}>
                    Manage Preferences
                  </Link>
                  {' · '}
                </>
              )}
              <Link href={baseUrl} style={footerLink}>
                Visit Blog
              </Link>
            </Text>

            <Text style={addressText}>
              Geethanjali College of Engineering and Technology (GCET)
              <br />
              Cheeryal, Keesara, Medchal-Malkajgiri, Telangana 501301
            </Text>

            <Text style={copyrightText}>
              © {new Date().getFullYear()} GCET Blog. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const body: React.CSSProperties = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
  margin: 0,
  padding: 0,
}

const container: React.CSSProperties = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  maxWidth: '600px',
  borderRadius: '8px',
  overflow: 'hidden',
  border: '1px solid #e5e7eb',
}

const header: React.CSSProperties = {
  padding: '24px 32px',
  textAlign: 'center' as const,
}

const brandTitle: React.CSSProperties = {
  display: 'inline-block',
  verticalAlign: 'middle',
  fontSize: '20px',
  fontWeight: 700,
  color: '#111827',
  margin: 0,
}

const content: React.CSSProperties = {
  padding: '0 32px 24px',
}

const divider: React.CSSProperties = {
  borderColor: '#e5e7eb',
  margin: '0',
}

const footer: React.CSSProperties = {
  padding: '24px 32px',
  textAlign: 'center' as const,
}

const footerText: React.CSSProperties = {
  color: '#6b7280',
  fontSize: '12px',
  lineHeight: '18px',
  margin: '0 0 12px',
}

const footerLinks: React.CSSProperties = {
  color: '#6b7280',
  fontSize: '12px',
  lineHeight: '18px',
  margin: '0 0 12px',
}

const footerLink: React.CSSProperties = {
  color: '#3b82f6',
  textDecoration: 'underline',
}

const addressText: React.CSSProperties = {
  color: '#9ca3af',
  fontSize: '11px',
  lineHeight: '16px',
  margin: '0 0 8px',
}

const copyrightText: React.CSSProperties = {
  color: '#9ca3af',
  fontSize: '11px',
  lineHeight: '16px',
  margin: 0,
}
