/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Migration Script: Tag Existing Data with Default Institution
 * ─────────────────────────────────────────────────────────────
 *
 * This script ensures every document across all institution-scoped
 * collections has an `institution` field set to the default institution.
 *
 * Usage:
 *   npx tsx scripts/migrate-to-multitenant.ts
 *
 * Prerequisites:
 *   - MongoDB must be running and DATABASE_URI set in .env
 *   - A default institution should already exist, or the script creates one
 *
 * What it does:
 *   1. Finds or creates a default institution (using DEFAULT_INSTITUTION_CODE env or "gcet")
 *   2. For each collection, finds all docs where `institution` is null/missing
 *   3. Sets `institution` to the default institution ID
 *   4. Prints a summary of changes
 */

import 'dotenv/config'
import { getPayload } from 'payload'
import type { CollectionSlug } from 'payload'
import configPromise from '../src/payload.config'

// ── Collections that have an `institution` field ──────────────────────
const INSTITUTION_SCOPED_COLLECTIONS: CollectionSlug[] = [
  'pages',
  'posts',
  'media',
  'categories',
  'users',
  'votes',
  'page-views',
  'admin-logs',
  'comments',
  'feedback',
  'templates',
  'newsletter-subscribers',
  'newsletters',
  'newsletter-events',
  'events',
  'clubs',
] as const

const DEFAULT_CODE = process.env.DEFAULT_INSTITUTION_CODE || 'gcet'

async function main() {
  console.log('🏛️  Multi-Tenant Migration Script')
  console.log('─'.repeat(50))
  console.log(`Default institution code: ${DEFAULT_CODE}\n`)

  const payload = await getPayload({ config: configPromise })

  // ── Step 1: Find or create default institution ──────────────────────
  let defaultInstitution = (
    await payload.find({
      collection: 'institutions',
      where: { code: { equals: DEFAULT_CODE } },
      limit: 1,
      depth: 0,
    })
  ).docs[0]

  if (!defaultInstitution) {
    console.log(`⚠️  No institution with code "${DEFAULT_CODE}" found. Creating one...`)
    defaultInstitution = await payload.create({
      collection: 'institutions',
      data: {
        name: DEFAULT_CODE.toUpperCase(),
        code: DEFAULT_CODE,
        shortName: DEFAULT_CODE.toUpperCase(),
        status: 'active',
        tier: 'pilot',
        settings: {
          enabledModules: ['blog', 'events', 'clubs'] as ('blog' | 'events' | 'clubs')[],
          maxUsers: 0,
        },
      } as any,
    })
    console.log(`✅ Created institution: ${defaultInstitution.name} (${defaultInstitution.id})\n`)
  } else {
    console.log(`✅ Found institution: ${defaultInstitution.name} (${defaultInstitution.id})\n`)
  }

  const institutionId = defaultInstitution.id as string

  // ── Step 2: Tag documents in each collection ────────────────────────
  const summary: Array<{ collection: string; tagged: number; total: number; skipped: number }> = []

  for (const slug of INSTITUTION_SCOPED_COLLECTIONS) {
    process.stdout.write(`📦 ${slug.padEnd(25)}`)

    try {
      // Count total docs
      const totalResult = await payload.count({
        collection: slug,
      })

      // Count docs already tagged
      const taggedResult = await payload.count({
        collection: slug,
        where: {
          institution: { exists: true },
        },
      })

      const untagged = totalResult.totalDocs - taggedResult.totalDocs

      if (untagged === 0) {
        console.log(`  ✓ ${totalResult.totalDocs} docs (all tagged)`)
        summary.push({
          collection: slug,
          tagged: 0,
          total: totalResult.totalDocs,
          skipped: totalResult.totalDocs,
        })
        continue
      }

      // Update all untagged docs
      const result = await payload.update({
        collection: slug,
        where: {
          or: [
            { institution: { exists: false } },
            { institution: { equals: null } },
          ],
        },
        data: {
          institution: institutionId,
        } as any,
      })

      const updatedCount = Array.isArray(result.docs) ? result.docs.length : 0
      console.log(`  ✅ Tagged ${updatedCount}/${totalResult.totalDocs} docs`)
      summary.push({
        collection: slug,
        tagged: updatedCount,
        total: totalResult.totalDocs,
        skipped: taggedResult.totalDocs,
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.log(`  ❌ Error: ${msg}`)
      summary.push({ collection: slug, tagged: 0, total: 0, skipped: 0 })
    }
  }

  // ── Step 3: Print summary ───────────────────────────────────────────
  console.log('\n' + '─'.repeat(50))
  console.log('📊 Migration Summary\n')

  let totalTagged = 0
  let totalDocs = 0

  for (const row of summary) {
    totalTagged += row.tagged
    totalDocs += row.total
  }

  console.log(`  Default institution:  ${defaultInstitution.name} (${institutionId})`)
  console.log(`  Collections scanned:  ${summary.length}`)
  console.log(`  Total documents:      ${totalDocs}`)
  console.log(`  Newly tagged:         ${totalTagged}`)
  console.log(`  Already tagged:       ${totalDocs - totalTagged}`)

  if (totalTagged > 0) {
    console.log('\n✅ Migration complete! All documents now have an institution.')
  } else {
    console.log('\n✅ All documents were already tagged. No changes needed.')
  }

  process.exit(0)
}

main().catch((err) => {
  console.error('\n❌ Migration failed:', err)
  process.exit(1)
})
