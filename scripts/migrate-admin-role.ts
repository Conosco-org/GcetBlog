/**
 * Migration Script: Merge admin role into editor + isAdmin flag
 *
 * This script migrates all users with role='admin' to:
 *   - role: 'editor'
 *   - isAdmin: true
 *   - canManageAdmins: true  (first admin only, or pass --all-super to promote all)
 *
 * Usage:
 *   npx tsx scripts/migrate-admin-role.ts              # dry-run by default
 *   npx tsx scripts/migrate-admin-role.ts --execute     # actually apply changes
 *   npx tsx scripts/migrate-admin-role.ts --execute --all-super  # all admins get canManageAdmins
 *
 * This script is idempotent — running it multiple times is safe.
 */

import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'

async function migrate() {
  const args = process.argv.slice(2)
  const dryRun = !args.includes('--execute')
  const allSuper = args.includes('--all-super')

  console.log('='.repeat(60))
  console.log('  Admin Role Migration')
  console.log(`  Mode: ${dryRun ? 'DRY RUN (pass --execute to apply)' : 'EXECUTING'}`)
  console.log(`  canManageAdmins: ${allSuper ? 'All admins' : 'First admin only'}`)
  console.log('='.repeat(60))
  console.log()

  const payload = await getPayload({ config })

  // Find all users who still have role='admin'
  const adminUsers = await payload.find({
    collection: 'users',
    where: {
      role: { equals: 'admin' },
    },
    limit: 0,
    depth: 0,
  })

  if (adminUsers.totalDocs === 0) {
    console.log('No users with role="admin" found. Migration may already be complete.')

    // Check for editor users who have isAdmin but might need canManageAdmins
    const editorAdmins = await payload.find({
      collection: 'users',
      where: {
        and: [
          { role: { equals: 'editor' } },
          { isAdmin: { equals: true } },
        ],
      },
      limit: 0,
      depth: 0,
    })

    if (editorAdmins.totalDocs > 0) {
      console.log(`Found ${editorAdmins.totalDocs} editor(s) with isAdmin=true:`)
      
      // Filter users who need canManageAdmins
      const needsCanManageAdmins = editorAdmins.docs.filter((u) => {
        const typedU = u as unknown as { canManageAdmins?: boolean }
        return !typedU.canManageAdmins
      })

      for (const u of editorAdmins.docs) {
        const typedU = u as unknown as { email: string; canManageAdmins?: boolean }
        console.log(`  - ${typedU.email} (canManageAdmins: ${typedU.canManageAdmins ?? false})`)
      }

      // If --all-super flag is set and there are users needing promotion
      if (allSuper && needsCanManageAdmins.length > 0) {
        console.log()
        console.log(`Promoting ${needsCanManageAdmins.length} isAdmin user(s) to canManageAdmins...`)
        console.log()

        for (const user of needsCanManageAdmins) {
          const typedUser = user as unknown as { id: string; email: string; name?: string }
          console.log(`  User: ${typedUser.name || typedUser.email}`)
          console.log(`    Email: ${typedUser.email}`)
          console.log(`    Setting: canManageAdmins=true`)

          if (!dryRun) {
            await payload.update({
              collection: 'users',
              id: typedUser.id,
              data: {
                canManageAdmins: true,
              } as Record<string, unknown>,
              overrideAccess: true,
            })
            console.log(`    ✓ Updated successfully`)
          } else {
            console.log(`    (skipped — dry run)`)
          }
          console.log()
        }

        console.log('='.repeat(60))
        if (dryRun) {
          console.log('  DRY RUN complete. Run with --execute --all-super to apply changes.')
        } else {
          console.log(`  Promotion complete. ${needsCanManageAdmins.length} user(s) updated.`)
        }
        console.log('='.repeat(60))
      }
    }

    process.exit(0)
  }

  console.log(`Found ${adminUsers.totalDocs} user(s) with role="admin":`)
  console.log()

  let isFirst = true
  for (const user of adminUsers.docs) {
    const typedUser = user as unknown as { id: string; email: string; name?: string }
    const giveSuper = allSuper || isFirst

    console.log(`  User: ${typedUser.name || typedUser.email}`)
    console.log(`    ID:    ${typedUser.id}`)
    console.log(`    Email: ${typedUser.email}`)
    console.log(`    Will set: role=editor, isAdmin=true, canManageAdmins=${giveSuper}`)

    if (!dryRun) {
      await payload.update({
        collection: 'users',
        id: typedUser.id,
        data: {
          role: 'editor',
          isAdmin: true,
          canManageAdmins: giveSuper,
        } as Record<string, unknown>,
        overrideAccess: true,
      })
      console.log(`    ✓ Updated successfully`)
    } else {
      console.log(`    (skipped — dry run)`)
    }

    console.log()
    isFirst = true
  }

  console.log('='.repeat(60))
  if (dryRun) {
    console.log('  DRY RUN complete. Run with --execute to apply changes.')
  } else {
    console.log(`  Migration complete. ${adminUsers.totalDocs} user(s) updated.`)
  }
  console.log('='.repeat(60))

  process.exit(0)
}

migrate().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
