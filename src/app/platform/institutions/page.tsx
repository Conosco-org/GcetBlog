import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { InstitutionActions } from './components/InstitutionActions'
import type { Institution } from '@/payload-types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  active: { label: 'Active', variant: 'default' },
  trial: { label: 'Trial', variant: 'secondary' },
  suspended: { label: 'Suspended', variant: 'destructive' },
}

export default async function InstitutionsPage() {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user || (user as { role?: string }).role !== 'superadmin') {
    redirect('/login')
  }

  const [institutionsResult, totalUsers] = await Promise.all([
    payload.find({
      collection: 'institutions',
      limit: 100,
      sort: 'name',
      depth: 0,
    }),
    payload.count({ collection: 'users' }),
  ])

  const institutions = institutionsResult.docs as Institution[]

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Institutions</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {institutions.length} institution{institutions.length !== 1 ? 's' : ''} ·{' '}
            {totalUsers.totalDocs} total users on platform
          </p>
        </div>
        <Button asChild>
          <Link href="/platform/institutions/new">
            <Plus className="h-4 w-4 mr-2" />
            New Institution
          </Link>
        </Button>
      </div>

      {/* Table */}
      {institutions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border rounded-lg">
          <Building2 className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="font-semibold text-lg">No institutions yet</h3>
          <p className="text-muted-foreground text-sm mt-1 mb-4">
            Get started by creating the first institution.
          </p>
          <Button asChild>
            <Link href="/platform/institutions/new">
              <Plus className="h-4 w-4 mr-2" />
              New Institution
            </Link>
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Institution</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Code</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Domains</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tier</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {institutions.map((inst) => {
                const domains = (inst.domains as Array<{ hostname: string; purpose: string }>) ?? []
                const status = STATUS_MAP[(inst.status as string) ?? 'trial'] ?? STATUS_MAP.trial
                return (
                  <tr key={inst.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium">{inst.name}</div>
                      {inst.shortName && (
                        <div className="text-xs text-muted-foreground">{inst.shortName}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                        {inst.code}
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      {domains.length > 0 ? (
                        <div className="flex flex-col gap-0.5">
                          {domains.slice(0, 2).map((d, i) => (
                            <span key={i} className="text-xs text-muted-foreground">
                              {d.hostname}
                            </span>
                          ))}
                          {domains.length > 2 && (
                            <span className="text-xs text-muted-foreground">
                              +{domains.length - 2} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {inst.code}.sites.conosco.in
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-xs capitalize">
                        {(inst.tier as string) ?? 'pilot'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <InstitutionActions
                          id={String(inst.id)}
                          name={inst.name ?? ''}
                          status={(inst.status as string) ?? 'trial'}
                        />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
