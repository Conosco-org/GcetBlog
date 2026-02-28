'use client'

/**
 * Newsletters Table Component
 *
 * Displays newsletters in a table with status badges, stats, and actions.
 */

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Eye, Edit } from 'lucide-react'
import { DataTablePagination } from '@/components/base/DataTablePagination'
import type { Newsletter } from '@/payload-types'

interface NewslettersTableProps {
  newsletters: Newsletter[]
  totalPages: number
  currentPage: number
}

export function NewslettersTable({
  newsletters,
  totalPages,
  currentPage,
}: NewslettersTableProps) {
  return (
    <>
      <Card className="mt-6 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Recipients</TableHead>
              <TableHead>Open Rate</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {newsletters.map((newsletter) => (
              <TableRow key={newsletter.id}>
                {/* Campaign Title */}
                <TableCell className="font-medium max-w-xs">
                  <Link
                    href={`/editor/newsletter/${newsletter.id}`}
                    className="hover:underline line-clamp-1"
                  >
                    {newsletter.title}
                  </Link>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {newsletter.subject}
                  </p>
                </TableCell>

                {/* Type */}
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {newsletter.type === 'manual' ? 'Manual' : 'Auto-Digest'}
                  </Badge>
                </TableCell>

                {/* Status */}
                <TableCell>
                  <StatusBadge status={newsletter.status ?? 'draft'} />
                </TableCell>

                {/* Recipients */}
                <TableCell>
                  {newsletter.stats?.totalRecipients?.toLocaleString() ?? '-'}
                </TableCell>

                {/* Open Rate */}
                <TableCell>
                  {newsletter.stats?.totalRecipients &&
                  newsletter.stats.totalRecipients > 0
                    ? `${((newsletter.stats.opened ?? 0) / newsletter.stats.totalRecipients * 100).toFixed(1)}%`
                    : '-'}
                </TableCell>

                {/* Created */}
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(newsletter.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/editor/newsletter/${newsletter.id}`}>
                        <Eye className="w-4 h-4" />
                      </Link>
                    </Button>
                    {newsletter.status === 'draft' && (
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/editor/newsletter/${newsletter.id}/edit`}>
                          <Edit className="w-4 h-4" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4">
          <DataTablePagination currentPage={currentPage} totalPages={totalPages} />
        </div>
      )}
    </>
  )
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
    draft: { variant: 'secondary', label: 'Draft' },
    scheduled: { variant: 'default', label: 'Scheduled' },
    sending: { variant: 'default', label: 'Sending...' },
    sent: { variant: 'outline', label: 'Sent' },
    failed: { variant: 'destructive', label: 'Failed' },
  }

  const config = variants[status] ?? { variant: 'outline' as const, label: status }

  return (
    <Badge variant={config.variant} className="text-xs">
      {config.label}
    </Badge>
  )
}
