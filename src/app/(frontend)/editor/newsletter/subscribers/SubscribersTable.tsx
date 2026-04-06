'use client'

/**
 * Subscribers Table Component
 *
 * Displays newsletter subscribers in a table with status badges and actions.
 */

import { Badge } from '@/frontend/components/ui/badge'

import { Card } from '@/frontend/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/frontend/components/ui/table'
import { Mail, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { DataTablePagination } from '@frontend/components/base/DataTablePagination'
import type { NewsletterSubscriber } from '@/shared/types/payload-types'

interface SubscribersTableProps {
  subscribers: NewsletterSubscriber[]
  totalPages: number
  currentPage: number
}

export function SubscribersTable({
  subscribers,
  totalPages,
  currentPage,
}: SubscribersTableProps) {
  return (
    <>
      <Card className="mt-6 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subscriber</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Subscribed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscribers.map((subscriber) => (
              <TableRow key={subscriber.id}>
                {/* Subscriber Email & Name */}
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="truncate">{subscriber.email}</p>
                      {subscriber.name && (
                        <p className="text-xs text-muted-foreground truncate">{subscriber.name}</p>
                      )}
                    </div>
                  </div>
                </TableCell>

                {/* Status */}
                <TableCell>
                  <StatusBadge status={subscriber.status ?? 'pending'} />
                </TableCell>

                {/* Source */}
                <TableCell className="text-sm capitalize">
                  {subscriber.source ?? 'unknown'}
                </TableCell>

                {/* Frequency */}
                <TableCell>
                  <Badge variant="outline" className="text-xs capitalize">
                    {subscriber.frequency ?? 'weekly'}
                  </Badge>
                </TableCell>

                {/* Subscribed Date */}
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(subscriber.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
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
  const config: Record<
    string,
    {
      icon: React.ComponentType<{ className?: string }>
      label: string
      className: string
    }
  > = {
    active: {
      icon: CheckCircle,
      label: 'Active',
      className: 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400',
    },
    pending: {
      icon: Clock,
      label: 'Pending',
      className: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
    },
    unsubscribed: {
      icon: XCircle,
      label: 'Unsubscribed',
      className: 'bg-gray-100 text-gray-700 dark:bg-gray-950/30 dark:text-gray-400',
    },
    bounced: {
      icon: AlertTriangle,
      label: 'Bounced',
      className: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400',
    },
    complained: {
      icon: AlertTriangle,
      label: 'Complained',
      className: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400',
    },
  }

  const { icon: Icon, label, className } = config[status] ?? config.pending

  return (
    <Badge variant="outline" className={`text-xs flex items-center gap-1 w-fit ${className}`}>
      <Icon className="w-3 h-3" />
      {label}
    </Badge>
  )
}
