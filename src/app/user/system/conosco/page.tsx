import React from 'react'
import { CheckCircle2, AlertCircle, Globe, Clock, Activity, RefreshCw, Zap, Server } from 'lucide-react'
import { getConoscoService } from '@/services/conosco'
import { getCachedProviderHealth, getCachedEventStats, getCachedClubStats } from '@/services/conosco/cached'
import { themeConfig } from '@/custom/theme'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Conosco Integration',
}

export const dynamic = 'force-dynamic'

export default async function ConoscoSystemPage() {
  const { isConnected, provider } = getConoscoService()

  let healthData: { healthy: boolean; responseTime?: number; version?: string; message?: string } | null = null
  let eventStats: { total?: number; upcoming?: number; ongoing?: number; completed?: number } | null = null
  let clubStats: { total?: number; active?: number } | null = null
  const errors: string[] = []

  if (isConnected) {
    // Run all checks in parallel
    const results = await Promise.allSettled([
      getCachedProviderHealth(),
      getCachedEventStats(),
      getCachedClubStats(),
    ])

    if (results[0].status === 'fulfilled') {
      const h = results[0].value
      healthData = { healthy: h.healthy, responseTime: h.responseTimeMs, version: h.projectionVersion, message: h.error }
    } else {
      errors.push(`Health check: ${results[0].reason}`)
    }

    if (results[1].status === 'fulfilled') {
      eventStats = results[1].value.data
    } else {
      errors.push(`Event stats: ${results[1].reason}`)
    }

    if (results[2].status === 'fulfilled') {
      clubStats = results[2].value.data
    } else {
      errors.push(`Club stats: ${results[2].reason}`)
    }
  }

  const statusColor = !isConnected
    ? 'border-gray-200 bg-gray-50 dark:bg-gray-900/10'
    : healthData?.healthy
      ? 'border-green-200 bg-green-50 dark:bg-green-900/10'
      : 'border-red-200 bg-red-50 dark:bg-red-900/10'

  const statusIcon = !isConnected
    ? <AlertCircle className="h-6 w-6 text-gray-400" />
    : healthData?.healthy
      ? <CheckCircle2 className="h-6 w-6 text-green-600" />
      : <AlertCircle className="h-6 w-6 text-red-500" />

  const statusLabel = !isConnected
    ? 'Not Configured'
    : healthData?.healthy
      ? 'Connected & Healthy'
      : 'Connection Error'

  return (
    <div className="p-8 min-h-screen max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Server className="h-7 w-7" />
          Conosco Integration
        </h1>
        <p className="text-muted-foreground mt-1">
          Monitor and manage the connection to the Conosco Public Projection API
        </p>
      </div>

      {/* Connection Status Card */}
      <div className={`rounded-xl border p-6 mb-8 ${statusColor}`}>
        <div className="flex items-start gap-4">
          {statusIcon}
          <div className="flex-1">
            <h2 className="text-lg font-semibold">{statusLabel}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {!isConnected
                ? 'Set CONOSCO_API_URL, CONOSCO_API_KEY, and CONOSCO_INSTITUTION_CODE environment variables to enable.'
                : healthData?.healthy
                  ? 'The Conosco API is responding and data is being synced.'
                  : healthData?.message || 'Unable to reach the Conosco API.'}
            </p>
            {healthData?.version && (
              <p className="text-xs text-muted-foreground mt-2">
                API Version: <code className="bg-muted px-1.5 py-0.5 rounded">{healthData.version}</code>
              </p>
            )}
            {healthData?.responseTime && (
              <p className="text-xs text-muted-foreground mt-1">
                Response time: {healthData.responseTime}ms
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Configuration */}
      <div className="rounded-xl border border-border bg-card p-6 mb-6">
        <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-xs uppercase tracking-wider text-muted-foreground/70">Institution Code</span>
            <p className="text-sm font-medium font-mono">{themeConfig.institutionCode}</p>
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider text-muted-foreground/70">API URL</span>
            <p className="text-sm font-medium font-mono truncate">
              {process.env.CONOSCO_API_URL || 'Not set'}
            </p>
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider text-muted-foreground/70">API Key</span>
            <p className="text-sm font-medium font-mono">
              {process.env.CONOSCO_API_KEY ? '••••••••' + process.env.CONOSCO_API_KEY.slice(-4) : 'Not set'}
            </p>
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider text-muted-foreground/70">Platform Version</span>
            <p className="text-sm font-medium">{themeConfig.version}</p>
          </div>
        </div>
      </div>

      {/* Data Overview */}
      {isConnected && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Events */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Events
              </h3>
              <Link href="/user/events/sync-preview">
                <Button variant="outline" size="sm" className="text-xs">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Sync
                </Button>
              </Link>
            </div>
            {eventStats ? (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-medium">{eventStats.total ?? '—'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Upcoming</span>
                  <span className="font-medium text-blue-600">{eventStats.upcoming ?? '—'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ongoing</span>
                  <span className="font-medium text-green-600">{eventStats.ongoing ?? '—'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Completed</span>
                  <span className="font-medium text-gray-500">{eventStats.completed ?? '—'}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Unable to fetch stats</p>
            )}
          </div>

          {/* Clubs */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Clubs
              </h3>
              <Link href="/user/clubs/sync-preview">
                <Button variant="outline" size="sm" className="text-xs">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Sync
                </Button>
              </Link>
            </div>
            {clubStats ? (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-medium">{clubStats.total ?? '—'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Active</span>
                  <span className="font-medium text-green-600">{clubStats.active ?? '—'}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Unable to fetch stats</p>
            )}
          </div>
        </div>
      )}

      {/* Cache Info */}
      <div className="rounded-xl border border-border bg-card p-6 mb-6">
        <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Cache Configuration
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Events cache TTL</span>
            <span className="font-mono">5 min</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Clubs cache TTL</span>
            <span className="font-mono">10 min</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Stats cache TTL</span>
            <span className="font-mono">15 min</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Health check cache TTL</span>
            <span className="font-mono">1 min</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          Use the <code className="bg-muted px-1 py-0.5 rounded">POST /api/revalidate</code> endpoint
          to manually invalidate cached data.
        </p>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/10 p-6">
          <h3 className="text-base font-semibold text-red-700 mb-2">Errors</h3>
          <ul className="space-y-1">
            {errors.map((err, i) => (
              <li key={i} className="text-sm text-red-600">{err}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
