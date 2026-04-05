import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'

interface ImportResult {
  imported: number
  skipped: number
  errors: string[]
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const reqHeaders = await headers()
    const { user } = await payload.auth({ headers: reqHeaders })

    if (!user || !('role' in user) || user.role !== 'editor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const text = await file.text()
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)

    if (lines.length < 2) {
      return NextResponse.json({ error: 'CSV is empty or missing header row' }, { status: 400 })
    }

    // Parse header row (case-insensitive)
    const headerRow = lines[0]!.toLowerCase().split(',').map((h) => h.trim().replace(/"/g, ''))
    const emailIdx = headerRow.indexOf('email')
    const nameIdx = headerRow.indexOf('name')
    const frequencyIdx = headerRow.indexOf('frequency')

    if (emailIdx === -1) {
      return NextResponse.json({ error: 'CSV must have an "email" column' }, { status: 400 })
    }

    const result: ImportResult = { imported: 0, skipped: 0, errors: [] }

    for (let i = 1; i < lines.length; i++) {
      const cols = parseCSVLine(lines[i]!)
      const email = cols[emailIdx]?.trim()

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        result.errors.push(`Row ${i + 1}: invalid or missing email`)
        continue
      }

      // Check for duplicate
      const existing = await payload.find({
        collection: 'newsletter-subscribers',
        where: { email: { equals: email } },
        limit: 1,
        depth: 0,
      })

      if (existing.docs.length > 0) {
        result.skipped++
        continue
      }

      try {
        await payload.create({
          collection: 'newsletter-subscribers',
          data: {
            email,
            name: nameIdx !== -1 ? (cols[nameIdx]?.trim() || undefined) : undefined,
            frequency:
              frequencyIdx !== -1 && ['daily', 'weekly', 'monthly'].includes(cols[frequencyIdx]?.trim() ?? '')
                ? (cols[frequencyIdx]!.trim() as 'daily' | 'weekly' | 'monthly')
                : 'weekly',
            status: 'active',
            source: 'admin_import',
          },
        })
        result.imported++
      } catch {
        result.errors.push(`Row ${i + 1}: failed to create subscriber for ${email}`)
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json({ error: 'Import failed' }, { status: 500 })
  }
}

/** Parses a single CSV line respecting quoted fields */
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current)
  return result
}
