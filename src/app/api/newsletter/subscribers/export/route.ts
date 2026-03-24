import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const reqHeaders = await headers()
    const { user } = await payload.auth({ headers: reqHeaders })

    if (!user || (user as any).role !== 'editor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const statusFilter = searchParams.get('status') || ''
    const frequencyFilter = searchParams.get('frequency') || ''

    // Build where clause from optional filters
    const whereConditions: Record<string, unknown>[] = []
    if (statusFilter) whereConditions.push({ status: { equals: statusFilter } })
    if (frequencyFilter) whereConditions.push({ frequency: { equals: frequencyFilter } })
    const where = whereConditions.length > 0 ? { and: whereConditions } : undefined

    // Fetch all matching subscribers (no pagination)
    const result = await payload.find({
      collection: 'newsletter-subscribers',
      limit: 100000,
      pagination: false,
      sort: '-createdAt',
      depth: 0,
      where: where as any,
      select: {
        email: true,
        name: true,
        status: true,
        frequency: true,
        source: true,
        createdAt: true,
        confirmedAt: true,
      },
    })

    // Build CSV
    const csvRows: string[] = [
      'email,name,status,frequency,source,subscribedAt,confirmedAt',
    ]

    for (const sub of result.docs) {
      const row = [
        sub.email ?? '',
        sub.name ? `"${String(sub.name).replace(/"/g, '""')}"` : '',
        sub.status ?? '',
        sub.frequency ?? '',
        sub.source ?? '',
        sub.createdAt ? new Date(sub.createdAt).toISOString() : '',
        (sub as any).confirmedAt ? new Date((sub as any).confirmedAt).toISOString() : '',
      ]
      csvRows.push(row.join(','))
    }

    const csv = csvRows.join('\n')
    const filename = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}
