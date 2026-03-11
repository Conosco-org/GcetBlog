/**
 * Migration Script: Legacy → Multi-tenant RBAC
 *
 * Migrates users and content from the old schema (contributor/editor + isAdmin + canManageAdmins)
 * to the new multi-tenant RBAC schema (superadmin/user + roleAssignments + institution).
 *
 * Mapping:
 *   editor + isAdmin + canManageAdmins  →  superadmin (platform owner)
 *   editor + isAdmin                    →  user + institution_admin role assignment
 *   editor                              →  user + blog_editor role assignment
 *   contributor                         →  user + blog_author role assignment
 *
 * Also:
 *   1. Creates the initial GCET institution document
 *   2. Links all existing users to the GCET institution
 *   3. Links all existing content (posts, pages, categories, etc.) to the GCET institution
 *
 * Usage:
 *   node scripts/migrate-to-rbac.js
 *
 * Prerequisites:
 *   - Dev server should NOT be running
 *   - Take a database backup before running
 */

import { getPayload } from 'payload'
import config from '../src/payload.config.js'

const INSTITUTION_CODE = 'gcet'
const INSTITUTION_NAME = 'Geethanjali College of Engineering & Technology'
const INSTITUTION_SHORT = 'GCET'

// Collections that have the institution field
const CONTENT_COLLECTIONS = [
  'posts',
  'pages',
  'categories',
  'events',
  'clubs',
  'admin-logs',
  'media',
  'comments',
  'feedback',
]

async function migrate() {
  console.log('🚀 Starting RBAC Migration...\n')

  const payload = await getPayload({ config })

  // ─────────────────────────────────────────────────────────────
  // Step 1: Create the GCET institution (if it doesn't already exist)
  // ─────────────────────────────────────────────────────────────
  console.log('📌 Step 1: Creating institution...')

  let institution
  const existingInst = await payload.find({
    collection: 'institutions',
    where: { code: { equals: INSTITUTION_CODE } },
    limit: 1,
  })

  if (existingInst.docs.length > 0) {
    institution = existingInst.docs[0]
    console.log(`   ✅ Institution "${institution.name}" already exists (ID: ${institution.id})`)
  } else {
    institution = await payload.create({
      collection: 'institutions',
      data: {
        name: INSTITUTION_NAME,
        code: INSTITUTION_CODE,
        shortName: INSTITUTION_SHORT,
        active: true,
        settings: {
          enabledModules: ['blog', 'events', 'clubs', 'newsletter', 'conosco'],
          maxUsers: 500,
        },
      },
    })
    console.log(`   ✅ Created institution "${institution.name}" (ID: ${institution.id})`)
  }

  const institutionId = institution.id

  // ─────────────────────────────────────────────────────────────
  // Step 2: Migrate users
  // ─────────────────────────────────────────────────────────────
  console.log('\n👥 Step 2: Migrating users...')

  // Fetch ALL users (paginate if needed)
  let page = 1
  let hasMore = true
  let totalMigrated = 0
  const stats = { superadmin: 0, institution_admin: 0, blog_editor: 0, blog_author: 0, no_role: 0 }

  while (hasMore) {
    const users = await payload.find({
      collection: 'users',
      page,
      limit: 50,
      depth: 0,
    })

    for (const user of users.docs) {
      const oldRole = user.role
      const wasAdmin = user.isAdmin === true
      const couldManageAdmins = user.canManageAdmins === true

      let newBaseRole = 'user'
      const roleAssignments = []

      if (couldManageAdmins && wasAdmin) {
        // canManageAdmins + isAdmin → superadmin (platform owner)
        newBaseRole = 'superadmin'
        stats.superadmin++
      } else if (wasAdmin) {
        // isAdmin only → institution_admin
        newBaseRole = 'user'
        roleAssignments.push({
          assignedRole: 'institution_admin',
          scopeType: 'institution',
          scopeId: institutionId,
          scopeLabel: INSTITUTION_SHORT,
        })
        stats.institution_admin++
      } else if (oldRole === 'editor') {
        // editor → blog_editor
        newBaseRole = 'user'
        roleAssignments.push({
          assignedRole: 'blog_editor',
          scopeType: 'institution',
          scopeId: institutionId,
          scopeLabel: INSTITUTION_SHORT,
        })
        stats.blog_editor++
      } else if (oldRole === 'contributor') {
        // contributor → blog_author
        newBaseRole = 'user'
        roleAssignments.push({
          assignedRole: 'blog_author',
          scopeType: 'institution',
          scopeId: institutionId,
          scopeLabel: INSTITUTION_SHORT,
        })
        stats.blog_author++
      } else {
        // Unknown role → user with no roles
        newBaseRole = 'user'
        stats.no_role++
      }

      try {
        // Use direct MongoDB update to avoid access control issues
        // Payload's update might reject due to new validation
        await payload.update({
          collection: 'users',
          id: user.id,
          data: {
            role: newBaseRole,
            institution: newBaseRole === 'superadmin' ? undefined : institutionId,
            roleAssignments: roleAssignments,
          },
          // Skip access control during migration
          overrideAccess: true,
        })

        totalMigrated++
        const label = newBaseRole === 'superadmin'
          ? '🔑 superadmin'
          : roleAssignments[0]?.assignedRole || 'user (no roles)'
        console.log(`   ✅ ${user.email || user.name || user.id} → ${label}`)
      } catch (err) {
        console.error(`   ❌ Failed to migrate ${user.email || user.id}:`, err.message)
      }
    }

    hasMore = users.hasNextPage
    page++
  }

  console.log(`\n   📊 Migration summary:`)
  console.log(`      Super Admins:       ${stats.superadmin}`)
  console.log(`      Institution Admins: ${stats.institution_admin}`)
  console.log(`      Blog Editors:       ${stats.blog_editor}`)
  console.log(`      Blog Authors:       ${stats.blog_author}`)
  console.log(`      No roles:           ${stats.no_role}`)
  console.log(`      Total migrated:     ${totalMigrated}`)

  // ─────────────────────────────────────────────────────────────
  // Step 3: Link all content to GCET institution
  // ─────────────────────────────────────────────────────────────
  console.log('\n📄 Step 3: Linking content to institution...')

  for (const collection of CONTENT_COLLECTIONS) {
    try {
      // Find docs that don't have an institution yet
      const docs = await payload.find({
        collection,
        where: {
          or: [
            { institution: { exists: false } },
            { institution: { equals: null } },
          ],
        },
        limit: 0, // Just get count first
        depth: 0,
        overrideAccess: true,
      })

      if (docs.totalDocs === 0) {
        console.log(`   ⏭️  ${collection}: No unlinked documents`)
        continue
      }

      // Update in batches
      let updated = 0
      let batchPage = 1
      let batchHasMore = true

      while (batchHasMore) {
        const batch = await payload.find({
          collection,
          where: {
            or: [
              { institution: { exists: false } },
              { institution: { equals: null } },
            ],
          },
          page: batchPage,
          limit: 100,
          depth: 0,
          overrideAccess: true,
        })

        for (const doc of batch.docs) {
          try {
            await payload.update({
              collection,
              id: doc.id,
              data: { institution: institutionId },
              overrideAccess: true,
            })
            updated++
          } catch (err) {
            console.error(`   ❌ Failed to update ${collection}/${doc.id}:`, err.message)
          }
        }

        batchHasMore = batch.hasNextPage
        batchPage++
      }

      console.log(`   ✅ ${collection}: ${updated} documents linked to ${INSTITUTION_SHORT}`)
    } catch (err) {
      // Collection might not exist yet — that's OK
      console.log(`   ⚠️  ${collection}: Skipped (${err.message})`)
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Done
  // ─────────────────────────────────────────────────────────────
  console.log('\n✅ Migration complete!')
  console.log(`   Institution: ${INSTITUTION_NAME} (${INSTITUTION_CODE})`)
  console.log(`   Users migrated: ${totalMigrated}`)
  console.log('\n⚠️  Next steps:')
  console.log('   1. Run `pnpm generate:types` to regenerate TypeScript types')
  console.log('   2. Run `pnpm build` to verify no build errors')
  console.log('   3. Test login with each user role')
  console.log('   4. Remove old fields (isAdmin, canManageAdmins) from Users collection when ready')

  process.exit(0)
}

migrate().catch((err) => {
  console.error('\n💥 Migration failed:', err)
  process.exit(1)
})
