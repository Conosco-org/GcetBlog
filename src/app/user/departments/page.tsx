import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Link from 'next/link'
import { Plus, GraduationCap, ExternalLink } from 'lucide-react'
import { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SearchInput } from '@/components/base/SearchInput'
import { FilterBar } from '@/components/base/FilterBar'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Departments Manager',
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

type Args = {
  searchParams: Promise<{
    q?: string
    category?: string
    page?: string
  }>
}

export default async function UserDepartmentsPage({ searchParams: searchParamsPromise }: Args) {
  const searchParams = await searchParamsPromise
  const query = searchParams.q || ''
  const categoryFilter = searchParams.category || ''
  const page = Number(searchParams.page || '1')

  const payload = await getPayload({ config: configPromise })

  const conditions: Record<string, unknown>[] = []
  if (query) {
    conditions.push({ title: { like: query } })
  }
  if (categoryFilter) {
    conditions.push({ category: { equals: categoryFilter } })
  }

  const departments = await payload.find({
    collection: 'departments',
    page,
    limit: 20,
    sort: '-updatedAt',
    depth: 0,
    where: (conditions.length > 0 ? { and: conditions } : {}) as import('payload').Where,
  })

  return (
    <div className="p-8 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <GraduationCap className="h-7 w-7" />
              Departments Manager
            </h1>
            <p className="text-muted-foreground">Manage academic departments and their landing pages</p>
          </div>
          <Link href="/user/departments/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Department
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <Suspense fallback={null}>
          <SearchInput
            placeholder="Search departments…"
            defaultValue={query}
            paramName="q"
          />
          <FilterBar
            filters={[
              {
                paramName: 'category',
                label: 'Category',
                options: [
                  { label: 'All Categories', value: '' },
                  { label: 'Engineering', value: 'engineering' },
                  { label: 'Science', value: 'science' },
                  { label: 'Arts & Humanities', value: 'arts' },
                  { label: 'Commerce', value: 'commerce' },
                  { label: 'Management', value: 'management' },
                  { label: 'Other', value: 'other' },
                ],
              },
            ]}
          />
        </Suspense>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-2xl font-bold">{departments.totalDocs}</p>
          <p className="text-xs text-muted-foreground">Total Departments</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-2xl font-bold">
            {departments.docs.filter((d) => d._status === 'published').length}
          </p>
          <p className="text-xs text-muted-foreground">Published</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-2xl font-bold">
            {departments.docs.filter((d) => d.featured).length}
          </p>
          <p className="text-xs text-muted-foreground">Featured</p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left text-xs font-medium text-muted-foreground p-3">Department</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-3">Code</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-3">Category</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-3">Status</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {departments.docs.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  No departments found.{' '}
                  <Link href="/user/departments/create" className="text-accent hover:underline">
                    Create one
                  </Link>
                </td>
              </tr>
            ) : (
              departments.docs.map((dept) => (
                <tr
                  key={dept.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{dept.title}</span>
                      {dept.featured && (
                        <Badge variant="secondary" className="text-[10px]">
                          Featured
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{dept.slug}</span>
                  </td>
                  <td className="p-3">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{dept.code}</code>
                  </td>
                  <td className="p-3 text-sm capitalize">{dept.category || '—'}</td>
                  <td className="p-3">
                    {dept._status !== 'published' ? (
                      <span className="text-[10px] text-amber-600 font-medium">Draft</span>
                    ) : (
                      <span className="text-[10px] text-green-600 font-medium">Published</span>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/user/departments/${dept.id}/edit`}
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                        title="Edit Department"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                      <Link
                        href={`/departments/${dept.slug}`}
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-accent"
                        title="View live"
                        target="_blank"
                      >
                        <GraduationCap className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {departments.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Page {departments.page} of {departments.totalPages} ({departments.totalDocs} departments)
          </p>
          <div className="flex gap-2">
            {(departments.page ?? 1) > 1 && (
              <Link href={`/user/departments?page=${(departments.page ?? 1) - 1}`}>
                <Button variant="outline" size="sm">
                  Previous
                </Button>
              </Link>
            )}
            {departments.hasNextPage && (
              <Link href={`/user/departments?page=${(departments.page ?? 1) + 1}`}>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
