import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Building2,
  Users,
  FileText,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  Globe,
  ShieldCheck,
} from 'lucide-react'
import type { Institution } from '@/payload-types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function PlatformRootPage() {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  await payload.auth({ headers: requestHeaders })

  const [institutions, totalUsers, totalPosts] = await Promise.all([
    payload.find({
      collection: 'institutions',
      limit: 50,
      sort: '-createdAt',
      depth: 0,
    }),
    payload.count({ collection: 'users' }),
    payload.count({ collection: 'posts' }),
  ])

  const activeCount = institutions.docs.filter((i) => (i as Institution).status === 'active').length

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1200px]">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Platform Overview</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage all institutions and platform-wide settings
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/collections/institutions/create">
            <Building2 className="h-4 w-4 mr-2" />
            Add Institution
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-t-4 border-t-amber-500">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Institutions</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{institutions.totalDocs}</p>
            <p className="text-xs text-muted-foreground mt-1">{activeCount} active</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-blue-500">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalUsers.totalDocs}</p>
            <p className="text-xs text-muted-foreground mt-1">Across all institutions</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-purple-500">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalPosts.totalDocs}</p>
            <p className="text-xs text-muted-foreground mt-1">All institutions</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-green-500">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Active Rate</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {institutions.totalDocs > 0
                ? Math.round((activeCount / institutions.totalDocs) * 100)
                : 0}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">Institutions online</p>
          </CardContent>
        </Card>
      </div>

      {/* Institutions list */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Institutions</CardTitle>
              <CardDescription>All registered institutions on the platform</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/collections/institutions">
                Manage in CMS <ArrowUpRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {institutions.docs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Building2 className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No institutions yet</p>
              <p className="text-xs mt-1">Add the first institution to get started</p>
              <Button className="mt-4" size="sm" asChild>
                <Link href="/admin/collections/institutions/create">Add Institution</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {institutions.docs.map((inst) => {
                const i = inst as Institution
                return (
                  <div
                    key={i.id}
                    className="flex items-center gap-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                  >
                    {/* Icon */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
                      <Building2 className="h-5 w-5 text-amber-600" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold truncate">{i.name}</p>
                        <Badge variant="outline" className="text-xs font-mono">
                          {i.code}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        {i.contact?.website && (
                          <a
                            href={i.contact.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors"
                          >
                            <Globe className="h-3 w-3" />
                            {i.contact.website.replace(/^https?:\/\//, '')}
                          </a>
                        )}
                        {i.settings?.enabledModules && i.settings.enabledModules.length > 0 && (
                          <div className="flex items-center gap-1">
                            {i.settings.enabledModules.map((m) => (
                              <Badge key={m} variant="secondary" className="text-xs py-0 h-4">
                                {m}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status + Actions */}
                    <div className="flex items-center gap-3 shrink-0">
                      {i.status === 'active' ? (
                        <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Active
                        </span>
                      ) : i.status === 'suspended' ? (
                        <span className="flex items-center gap-1 text-xs text-destructive">
                          <XCircle className="h-3.5 w-3.5" />
                          Suspended
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <XCircle className="h-3.5 w-3.5" />
                          Trial
                        </span>
                      )}
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/collections/institutions/${i.id}`}>
                          Edit
                        </Link>
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-3 gap-3">
          <Button variant="outline" className="justify-start gap-2 h-10" asChild>
            <Link href="/admin/collections/institutions/create">
              <Building2 className="h-4 w-4" />
              New Institution
            </Link>
          </Button>
          <Button variant="outline" className="justify-start gap-2 h-10" asChild>
            <Link href="/platform/users">
              <Users className="h-4 w-4" />
              View All Users
            </Link>
          </Button>
          <Button variant="outline" className="justify-start gap-2 h-10" asChild>
            <Link href="/admin">
              <ShieldCheck className="h-4 w-4" />
              Payload CMS Admin
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
