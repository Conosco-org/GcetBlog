import type { Metadata } from 'next/types'

import React, { Suspense } from 'react'
import Link from 'next/link'
import { GraduationCap, X } from 'lucide-react'
import { getDepartmentListingData } from '@/modules/departments/services/department-context'
import { DepartmentArchive } from '@/modules/departments/components/DepartmentArchive'
import { DepartmentsFilterBar } from './page.client'
import { getDomainScope } from '@/utilities/domainScope'

export const dynamic = 'force-dynamic'

const CATEGORY_OPTIONS = [
  { label: 'Engineering', value: 'engineering' },
  { label: 'Science', value: 'science' },
  { label: 'Arts & Humanities', value: 'arts' },
  { label: 'Commerce', value: 'commerce' },
  { label: 'Management', value: 'management' },
  { label: 'Other', value: 'other' },
]

type Args = {
  searchParams: Promise<{
    q?: string
    category?: string
    page?: string
  }>
}

export default async function DepartmentsPage({ searchParams: searchParamsPromise }: Args) {
  const searchParams = await searchParamsPromise
  const scope = await getDomainScope()

  // Blog-only domain: departments not available
  if (!scope.showPages) {
    return (
      <div className="container mx-auto px-6 py-24 text-center">
        <GraduationCap className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
        <h1 className="text-2xl font-semibold mb-2">Departments</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Departments are available on the main site. This domain is dedicated to blog content.
        </p>
        <Link
          href="/posts"
          className="inline-flex items-center gap-2 text-accent hover:underline text-sm"
        >
          Browse posts instead
        </Link>
      </div>
    )
  }

  const query = searchParams.q || ''
  const category = searchParams.category || ''
  const pageNumber = Number(searchParams.page || '1')

  const { departments, totalPages, totalDocs, page } = await getDepartmentListingData({
    page: pageNumber,
    limit: 12,
    category: category || undefined,
    search: query || undefined,
  })

  const hasActiveFilters = Boolean(query || category)

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="container mx-auto px-5 sm:px-6 pt-20 pb-4 md:pt-24 md:pb-6">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-accent mb-2">
            <GraduationCap className="h-5 w-5" />
            <span className="text-sm font-medium tracking-wide uppercase">Academic Departments</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl mb-2 leading-tight">
            {query
              ? `Results for "${query}"`
              : category
                ? `${CATEGORY_OPTIONS.find((c) => c.value === category)?.label ?? category} Departments`
                : 'Departments'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {hasActiveFilters
              ? `${totalDocs} ${totalDocs === 1 ? 'department' : 'departments'} found`
              : 'Academic departments, programs, and research divisions.'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto px-5 sm:px-6 mb-4">
        <Suspense fallback={null}>
          <DepartmentsFilterBar categories={CATEGORY_OPTIONS} />
        </Suspense>
      </div>

      {/* Count */}
      <div className="container mx-auto px-5 sm:px-6 mb-4">
        <p className="text-sm text-muted-foreground">
          {totalDocs > 0
            ? `Showing ${(page - 1) * 12 + 1}–${Math.min(page * 12, totalDocs)} of ${totalDocs}`
            : 'No departments found'}
        </p>
      </div>

      {/* Departments Grid */}
      {departments.length > 0 ? (
        <div className="container mx-auto px-5 sm:px-6">
          <DepartmentArchive departments={departments} />
        </div>
      ) : (
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <GraduationCap className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No departments found</h3>
            <p className="text-muted-foreground text-sm mb-3">
              {hasActiveFilters
                ? 'Try adjusting your search or filters.'
                : 'No departments have been published yet.'}
            </p>
            {hasActiveFilters && (
              <Link
                href="/departments"
                className="inline-flex items-center gap-1 text-accent hover:underline text-sm"
              >
                <X className="h-3 w-3" />
                Clear all filters
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="container mx-auto px-5 sm:px-6 py-10">
          <div className="flex items-center justify-center gap-2">
            {page > 1 && (
              <Link
                href={buildPageUrl(searchParams, page - 1)}
                className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted transition-colors"
              >
                Previous
              </Link>
            )}
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pageNum = getPageNumber(i, page, totalPages)
              return (
                <Link
                  key={pageNum}
                  href={buildPageUrl(searchParams, pageNum)}
                  className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                    pageNum === page
                      ? 'bg-accent text-accent-foreground font-medium'
                      : 'border border-border hover:bg-muted'
                  }`}
                >
                  {pageNum}
                </Link>
              )
            })}
            {page < totalPages && (
              <Link
                href={buildPageUrl(searchParams, page + 1)}
                className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted transition-colors"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function buildPageUrl(
  params: Record<string, string | undefined>,
  pageNum: number,
): string {
  const sp = new URLSearchParams()
  if (params.q) sp.set('q', params.q)
  if (params.category) sp.set('category', params.category)
  if (pageNum > 1) sp.set('page', String(pageNum))
  const qs = sp.toString()
  return `/departments${qs ? `?${qs}` : ''}`
}

function getPageNumber(index: number, currentPage: number, totalPages: number): number {
  if (totalPages <= 5) return index + 1
  if (currentPage <= 3) return index + 1
  if (currentPage >= totalPages - 2) return totalPages - 4 + index
  return currentPage - 2 + index
}

export function generateMetadata(): Metadata {
  return {
    title: 'Departments | GCET',
    description: 'Explore academic departments, programs, and research divisions.',
  }
}
