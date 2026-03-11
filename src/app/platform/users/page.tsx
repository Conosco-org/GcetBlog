import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, Building2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { User, Institution } from '@/payload-types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const PAGE_SIZE = 20

interface Props {
  searchParams: Promise<{ page?: string; institution?: string }>
}

type UserDoc = User & { institution?: Institution | string | null }

export default async function PlatformUsersPage({ searchParams }: Props) {
  const sp = await searchParams
  const currentPage = Math.max(1, Number(sp.page || '1'))
  const institutionFilter = sp.institution || ''

  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user || (user as { role?: string }).role !== 'superadmin') {
    redirect('/login')
  }

  const [usersResult, institutionsResult] = await Promise.all([
    payload.find({
      collection: 'users',
      page: currentPage,
      limit: PAGE_SIZE,
      sort: '-createdAt',
      depth: 1,
      ...(institutionFilter
        ? { where: { institution: { equals: institutionFilter } } }
        : {}),
    }),
    payload.find({
      collection: 'institutions',
      limit: 100,
      sort: 'name',
      depth: 0,
    }),
  ])

  const users = usersResult.docs as UserDoc[]
  const institutions = institutionsResult.docs as Institution[]
  const totalPages = usersResult.totalPages

  function buildParams(overrides: Record<string, string>) {
    const p = new URLSearchParams()
    if (institutionFilter) p.set('institution', institutionFilter)
    if (currentPage > 1) p.set('page', String(currentPage))
    Object.entries(overrides).forEach(([k, v]) => {
      if (v) p.set(k, v)
      else p.delete(k)
    })
    const str = p.toString()
    return str ? `?${str}` : ''
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">All Users</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {usersResult.totalDocs} user{usersResult.totalDocs !== 1 ? 's' : ''} across all institutions
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Institution:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={buildParams({ institution: '', page: '1' })}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              !institutionFilter
                ? 'bg-primary text-primary-foreground border-primary'
                : 'hover:bg-muted border-border'
            }`}
          >
            All
          </Link>
          {institutions.map((inst) => (
            <Link
              key={inst.id}
              href={buildParams({ institution: String(inst.id), page: '1' })}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                institutionFilter === String(inst.id)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'hover:bg-muted border-border'
              }`}
            >
              {inst.shortName ?? inst.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Table */}
      {users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border rounded-lg">
          <Users className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="font-semibold text-lg">No users found</h3>
          <p className="text-muted-foreground text-sm mt-1">
            {institutionFilter ? 'Try a different institution filter.' : 'No users on the platform yet.'}
          </p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">User</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Role</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Institution</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((u) => {
                const role = (u as { role?: string }).role ?? 'unknown'
                const instName =
                  u.institution && typeof u.institution === 'object'
                    ? (u.institution as Institution).shortName ?? (u.institution as Institution).name
                    : '—'

                return (
                  <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium">{u.name}</div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          role === 'superadmin'
                            ? 'default'
                            : role === 'institution_admin'
                              ? 'secondary'
                              : 'outline'
                        }
                        className="text-xs"
                      >
                        {role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {instName}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              asChild
              disabled={currentPage <= 1}
            >
              <Link href={buildParams({ page: String(currentPage - 1) })}>Previous</Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              asChild
              disabled={currentPage >= totalPages}
            >
              <Link href={buildParams({ page: String(currentPage + 1) })}>Next</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
