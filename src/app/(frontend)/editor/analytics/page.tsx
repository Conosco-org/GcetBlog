import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/frontend/components/ui/card'
import { PageHeader } from '@frontend/components/base/PageHeader'
import { formatDateTimeIST } from '@/frontend/lib/format-date-time'
import {
  Eye,
  Users,
  FileText,
  ThumbsUp,
  ArrowUp,
  TrendingUp,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  BarChart3,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user || !['editor', 'admin'].includes(user.role || '')) {
    redirect('/login')
  }

  // Time ranges
  const now = new Date()
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  // Parallel queries for stats
  const [
    totalViews,
    views24h,
    views7d,
    views30d,
    totalPosts,
    totalUsers,
    totalVotes,
    totalComments,
    topPosts,
    deviceBreakdown,
    recentViews,
  ] = await Promise.all([
    // Total all-time views
    payload.count({ collection: 'page-views' }),
    // Views last 24 hours
    payload.count({
      collection: 'page-views',
      where: { viewedAt: { greater_than: last24h.toISOString() } },
    }),
    // Views last 7 days
    payload.count({
      collection: 'page-views',
      where: { viewedAt: { greater_than: last7d.toISOString() } },
    }),
    // Views last 30 days
    payload.count({
      collection: 'page-views',
      where: { viewedAt: { greater_than: last30d.toISOString() } },
    }),
    // Total published posts
    payload.count({
      collection: 'posts',
      where: { _status: { equals: 'published' } },
    }),
    // Total users
    payload.count({ collection: 'users' }),
    // Total votes
    payload.count({ collection: 'votes' }),
    // Total comments
    payload.count({ collection: 'comments' }),
    // Top viewed posts (by slug count)
    payload.find({
      collection: 'page-views',
      where: {
        and: [
          { postSlug: { exists: true } },
          { viewedAt: { greater_than: last30d.toISOString() } },
        ],
      },
      sort: '-viewedAt',
      limit: 200,
      select: { postSlug: true, path: true },
    }),
    // Device breakdown last 30d
    payload.find({
      collection: 'page-views',
      where: { viewedAt: { greater_than: last30d.toISOString() } },
      limit: 500,
      select: { device: true },
    }),
    // Recent 20 page views
    payload.find({
      collection: 'page-views',
      sort: '-viewedAt',
      limit: 20,
      select: { path: true, viewedAt: true, device: true, referrer: true, browser: true },
    }),
  ])

  // Compute top posts by frequency
  const postViewCounts: Record<string, number> = {}
  for (const view of topPosts.docs) {
    const slug = view.postSlug || 'unknown'
    postViewCounts[slug] = (postViewCounts[slug] || 0) + 1
  }
  const topPostsList = Object.entries(postViewCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)

  // Device stats
  const deviceStats = { desktop: 0, mobile: 0, tablet: 0, unknown: 0 }
  for (const d of deviceBreakdown.docs) {
    const dev = (d.device as keyof typeof deviceStats) || 'unknown'
    deviceStats[dev] = (deviceStats[dev] || 0) + 1
  }
  const deviceTotal = Object.values(deviceStats).reduce((a, b) => a + b, 0)

  // Unique sessions last 30d (approximate from recent data)
  // Note: We don't have sessionId in select, so we just track total views
  // const uniqueSessions = new Set(topPosts.docs.map(() => Math.random())).size

  return (
    <div className="p-8 min-h-screen">
      <PageHeader
        title="Analytics Dashboard"
        description="Self-hosted analytics - track content performance and engagement"
      />

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-950 rounded-lg">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">{totalViews.totalDocs.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-950 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Views (24h)</p>
                <p className="text-2xl font-bold">{views24h.totalDocs.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-950 rounded-lg">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Views (7d)</p>
                <p className="text-2xl font-bold">{views7d.totalDocs.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-950 rounded-lg">
                <Globe className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Views (30d)</p>
                <p className="text-2xl font-bold">{views30d.totalDocs.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content & Engagement Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-950 rounded-lg">
                <FileText className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Published Posts</p>
                <p className="text-2xl font-bold">{totalPosts.totalDocs}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-100 dark:bg-pink-950 rounded-lg">
                <Users className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{totalUsers.totalDocs}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-950 rounded-lg">
                <ThumbsUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Votes</p>
                <p className="text-2xl font-bold">{totalVotes.totalDocs}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-950 rounded-lg">
                <ArrowUp className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Comments</p>
                <p className="text-2xl font-bold">{totalComments.totalDocs}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two-Column: Top Posts + Device Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Top Posts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5" />
              Top Posts (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topPostsList.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No page views recorded yet. Analytics start tracking when visitors view posts.</p>
            ) : (
              <div className="space-y-3">
                {topPostsList.map(([slug, count], i) => (
                  <div key={slug} className="flex items-center gap-3">
                    <span className="text-sm font-bold text-muted-foreground w-6 text-right">
                      {i + 1}.
                    </span>
                    <div className="flex-1 min-w-0">
                      <a
                        href={`/posts/${slug}`}
                        className="text-sm font-medium hover:underline truncate block"
                      >
                        {slug}
                      </a>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground shrink-0">
                      <Eye className="w-3.5 h-3.5" />
                      {count}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Device Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Monitor className="w-5 h-5" />
              Device Breakdown (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {deviceTotal === 0 ? (
              <p className="text-muted-foreground text-center py-8">No data yet.</p>
            ) : (
              <div className="space-y-4">
                {([
                  { key: 'desktop', label: 'Desktop', icon: Monitor, color: 'bg-blue-500' },
                  { key: 'mobile', label: 'Mobile', icon: Smartphone, color: 'bg-green-500' },
                  { key: 'tablet', label: 'Tablet', icon: Tablet, color: 'bg-amber-500' },
                  { key: 'unknown', label: 'Unknown', icon: Globe, color: 'bg-gray-400' },
                ] as const).map(({ key, label, icon: Icon, color }) => {
                  const count = deviceStats[key]
                  const pct = deviceTotal > 0 ? (count / deviceTotal) * 100 : 0
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Icon className="w-4 h-4 text-muted-foreground" />
                          <span>{label}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{count} ({Math.round(pct)}%)</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2" aria-hidden="true">
                        <div className={`${color} h-full rounded-full transition-all`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Eye className="w-5 h-5" />
            Recent Page Views
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentViews.docs.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No page views recorded yet. Set up the tracking API to start collecting data.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2 font-medium">Page</th>
                    <th className="pb-2 font-medium">Device</th>
                    <th className="pb-2 font-medium">Browser</th>
                    <th className="pb-2 font-medium">Referrer</th>
                    <th className="pb-2 font-medium text-right">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentViews.docs.map((view) => (
                    <tr key={view.id} className="border-b last:border-0">
                      <td className="py-2 max-w-[200px] truncate">{view.path}</td>
                      <td className="py-2 capitalize">{view.device || '-'}</td>
                      <td className="py-2">{view.browser || '-'}</td>
                      <td className="py-2 max-w-[150px] truncate">{view.referrer || 'Direct'}</td>
                      <td className="py-2 text-right text-muted-foreground">
                        {view.viewedAt ? formatDateTimeIST(view.viewedAt) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
