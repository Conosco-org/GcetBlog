/**
 * Newsletter Digest Template
 *
 * Renders a collection of posts as a branded digest email.
 * Used for daily/weekly/monthly auto-generated digests.
 */

import {
  Button,
  Column,
  Heading,
  Img,
  Link,
  Row,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'
import { BaseLayout } from './base-layout'

export interface DigestPost {
  title: string
  excerpt: string
  slug: string
  heroImageUrl?: string
  authorName: string
  categoryName?: string
  publishedAt: string
}

interface NewsletterDigestProps {
  subscriberName?: string
  frequency: 'daily' | 'weekly' | 'monthly'
  posts: DigestPost[]
  baseUrl?: string
  unsubscribeUrl: string
  preferencesUrl: string
}

const frequencyLabels = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
}

export function NewsletterDigest({
  subscriberName,
  frequency,
  posts,
  baseUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? 'https://blog.gcet.edu.in',
  unsubscribeUrl,
  preferencesUrl,
}: NewsletterDigestProps) {
  const greeting = subscriberName ? `Hi ${subscriberName}` : 'Hi there'
  const label = frequencyLabels[frequency]

  return (
    <BaseLayout
      preview={`Your ${label} Digest - ${posts.length} new post${posts.length !== 1 ? 's' : ''}`}
      unsubscribeUrl={unsubscribeUrl}
      preferencesUrl={preferencesUrl}
      baseUrl={baseUrl}
    >
      {/* Greeting */}
      <Heading style={heading}>📰 Your {label} Digest</Heading>
      <Text style={greetingText}>
        {greeting}, here&apos;s what&apos;s new on the GCET Blog this{' '}
        {frequency === 'daily' ? 'day' : frequency === 'weekly' ? 'week' : 'month'}:
      </Text>

      {/* Post Cards */}
      {posts.map((post, index) => (
        <Section key={index} style={postCard}>
          <Row>
            {post.heroImageUrl && (
              <Column style={imageColumn} width={140}>
                <Link href={`${baseUrl}/posts/${post.slug}`}>
                  <Img
                    src={post.heroImageUrl}
                    width={140}
                    height={93}
                    alt={post.title}
                    style={postImage}
                  />
                </Link>
              </Column>
            )}
            <Column style={contentColumn}>
              {post.categoryName && (
                <Text style={categoryBadge}>{post.categoryName}</Text>
              )}
              <Link
                href={`${baseUrl}/posts/${post.slug}`}
                style={{ textDecoration: 'none' }}
              >
                <Text style={postTitle}>{post.title}</Text>
              </Link>
              <Text style={postExcerpt}>
                {post.excerpt.length > 120
                  ? `${post.excerpt.substring(0, 120)}…`
                  : post.excerpt}
              </Text>
              <Text style={postMeta}>
                By {post.authorName} · {post.publishedAt}
              </Text>
            </Column>
          </Row>
        </Section>
      ))}

      {/* CTA */}
      <Section style={ctaSection}>
        <Button href={`${baseUrl}/posts`} style={ctaButton}>
          Browse All Posts →
        </Button>
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
  margin: '0 0 24px',
}

const postCard: React.CSSProperties = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '16px',
  border: '1px solid #e5e7eb',
}

const imageColumn: React.CSSProperties = {
  verticalAlign: 'top',
  paddingRight: '16px',
}

const contentColumn: React.CSSProperties = {
  verticalAlign: 'top',
}

const postImage: React.CSSProperties = {
  borderRadius: '6px',
  objectFit: 'cover' as const,
}

const categoryBadge: React.CSSProperties = {
  display: 'inline-block',
  backgroundColor: '#dbeafe',
  color: '#1d4ed8',
  fontSize: '11px',
  fontWeight: 600,
  padding: '2px 8px',
  borderRadius: '9999px',
  margin: '0 0 6px',
  lineHeight: '18px',
}

const postTitle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 600,
  color: '#111827',
  margin: '0 0 4px',
  lineHeight: '22px',
}

const postExcerpt: React.CSSProperties = {
  fontSize: '13px',
  color: '#6b7280',
  margin: '0 0 6px',
  lineHeight: '20px',
}

const postMeta: React.CSSProperties = {
  fontSize: '12px',
  color: '#9ca3af',
  margin: 0,
}

const ctaSection: React.CSSProperties = {
  textAlign: 'center' as const,
  padding: '8px 0 16px',
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
