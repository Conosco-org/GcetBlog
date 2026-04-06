/**
 * Newsletter Detail/Analytics Page
 *
 * Shows campaign details, send status, and analytics (opens, clicks, bounces).
 */

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { PageHeader } from '@frontend/components/base'
import { Button } from '@frontend/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@frontend/components/ui/card'
import { Badge } from '@frontend/components/ui/badge'
import {
  Eye,
  MousePointerClick,
  AlertTriangle,
  Edit,
  Send,
  Users,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function NewsletterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const payload = await getPayload({ config: configPromise })

  const newsletter = await payload.findByID({
    collection: 'newsletters',
    id,
    depth: 1,
  }).catch(() => notFound())

  // Fetch event analytics
  const [totalEvents, openEvents, clickEvents, bounceEvents, unsubEvents] = await Promise.all([
    payload.count({
      collection: 'newsletter-events',
      where: {
        and: [
          { newsletter: { equals: id } },
          { type: { equals: 'sent' } },
        ],
      },
    }),
    payload.count({
      collection: 'newsletter-events',
      where: {
        and: [
          { newsletter: { equals: id } },
          { type: { equals: 'opened' } },
        ],
      },
    }),
    payload.count({
      collection: 'newsletter-events',
      where: {
        and: [
          { newsletter: { equals: id } },
          { type: { equals: 'clicked' } },
        ],
      },
    }),
    payload.count({
      collection: 'newsletter-events',
      where: {
        and: [
          { newsletter: { equals: id } },
          { type: { equals: 'bounced' } },
        ],
      },
    }),
    payload.count({
      collection: 'newsletter-events',
      where: {
        and: [
          { newsletter: { equals: id } },
          { type: { equals: 'unsubscribed' } },
        ],
      },
    }),
  ])

  const totalSent = totalEvents.totalDocs
  const totalOpened = openEvents.totalDocs
  const totalClicked = clickEvents.totalDocs
  const totalBounced = bounceEvents.totalDocs
  const totalUnsubscribed = unsubEvents.totalDocs

  const openRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : '0.0'
  const clickRate = totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(1) : '0.0'

  return (
    <div className="p-8 min-h-screen max-w-6xl mx-auto">
      <PageHeader
        title={newsletter.title}
        description={newsletter.subject}
        action={
          <div className="flex gap-3">
            {newsletter.status === 'draft' && (
              <Button variant="outline" asChild>
                <Link href={`/editor/newsletter/compose?id=${id}&mode=edit`}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Link>
              </Button>
            )}
            {newsletter.status === 'draft' && (
              <Button asChild>
                <Link href={`/editor/newsletter/${id}/send`}>
                  <Send className="w-4 h-4 mr-2" />
                  Send Now
                </Link>
              </Button>
            )}
          </div>
        }
      />

      {/* Status Badge */}
      <div className="mt-4">
        <StatusBadge status={newsletter.status ?? 'draft'} />
      </div>

      {/* Campaign Info */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Campaign Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type:</span>
              <Badge variant="outline">{newsletter.type === 'manual' ? 'Manual' : 'Auto-Digest'}</Badge>
            </div>
            {newsletter.type === 'auto_digest' && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Frequency:</span>
                <span className="capitalize">{newsletter.frequency}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created:</span>
              <span>{new Date(newsletter.createdAt).toLocaleDateString()}</span>
            </div>
            {newsletter.sentAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sent:</span>
                <span>{new Date(newsletter.sentAt).toLocaleString()}</span>
              </div>
            )}
            {newsletter.scheduledFor && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Scheduled:</span>
                <span>{new Date(newsletter.scheduledFor).toLocaleString()}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Preview Text</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {newsletter.previewText || 'No preview text provided.'}
          </CardContent>
        </Card>
      </div>

      {/* Analytics (if sent) */}
      {newsletter.status === 'sent' && (
        <>
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-4">Performance</h2>
            <div className="grid gap-4 md:grid-cols-4">
              <MetricCard
                icon={Users}
                label="Total Sent"
                value={totalSent.toLocaleString()}
                color="blue"
              />
              <MetricCard
                icon={Eye}
                label="Opened"
                value={totalOpened.toLocaleString()}
                subtext={`${openRate}% open rate`}
                color="green"
              />
              <MetricCard
                icon={MousePointerClick}
                label="Clicked"
                value={totalClicked.toLocaleString()}
                subtext={`${clickRate}% click rate`}
                color="purple"
              />
              <MetricCard
                icon={AlertTriangle}
                label="Bounced"
                value={totalBounced.toLocaleString()}
                color="amber"
              />
            </div>
          </div>

          {totalUnsubscribed > 0 && (
            <Card className="mt-4 border-amber-200 dark:border-amber-900">
              <CardContent className="py-4 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <p className="text-sm">
                  <strong>{totalUnsubscribed}</strong> subscriber{totalUnsubscribed !== 1 && 's'} unsubscribed
                  after receiving this campaign.
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Content Preview */}
      {newsletter.type === 'manual' && newsletter.content && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Content Preview</CardTitle>
            <CardDescription>Newsletter body (truncated)</CardDescription>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <div className="text-sm text-muted-foreground line-clamp-10">
              {JSON.stringify(newsletter.content).slice(0, 500)}...
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Full content is rendered in emails. This is a JSON preview.
            </p>
          </CardContent>
        </Card>
      )}

      {newsletter.type === 'auto_digest' && Array.isArray(newsletter.posts) && newsletter.posts.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Included Posts</CardTitle>
            <CardDescription>{newsletter.posts.length} posts in this digest</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {newsletter.posts.slice(0, 10).map((post) => {
                const postObj = typeof post === 'object' && post && 'title' in post ? post : null
                return postObj ? (
                  <li key={postObj.id} className="text-sm">
                    • {postObj.title}
                  </li>
                ) : null
              })}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<
    string,
    { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }
  > = {
    draft: { variant: 'secondary', label: 'Draft' },
    scheduled: { variant: 'default', label: 'Scheduled' },
    sending: { variant: 'default', label: 'Sending...' },
    sent: { variant: 'outline', label: 'Sent' },
    failed: { variant: 'destructive', label: 'Failed' },
  }

  const config = variants[status] ?? { variant: 'outline' as const, label: status }

  return (
    <Badge variant={config.variant} className="text-sm px-3 py-1">
      {config.label}
    </Badge>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
  subtext,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  subtext?: string
  color: string
}) {
  const colorMap: Record<string, string> = {
    blue: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900',
    green: 'text-green-600 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900',
    purple:
      'text-purple-600 bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900',
    amber:
      'text-amber-600 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900',
  }

  return (
    <div className={`rounded-lg border p-4 ${colorMap[color] || ''}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4" />
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
      </div>
      <p className="text-3xl font-bold">{value}</p>
      {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
    </div>
  )
}
