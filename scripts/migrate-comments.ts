/**
 * Migration script for Comments collection
 * Adds new fields to existing comments for enhanced moderation features
 * 
 * Run with: npx tsx scripts/migrate-comments.ts
 */

import { getPayload } from 'payload'
import config from '../src/payload.config'

async function migrateComments() {
  console.log('Starting comment migration...')

  try {
    const payload = await getPayload({ config })

    // Fetch all existing comments
    const comments = await payload.find({
      collection: 'comments',
      limit: 10000, // Adjust if you have more comments
      pagination: false,
    })

    console.log(`Found ${comments.totalDocs} comments to migrate`)

    let successCount = 0
    let errorCount = 0

    // Update each comment with new fields
    for (const comment of comments.docs) {
      try {
        // Only update if fields don't already exist
        const updateData: any = {}

        if (comment.contentModified === undefined) {
          updateData.contentModified = false
        }

        if (!comment.revisionHistory || comment.revisionHistory.length === 0) {
          updateData.revisionHistory = []
        }

        // Only update if there are changes
        if (Object.keys(updateData).length > 0) {
          await payload.update({
            collection: 'comments',
            id: comment.id,
            data: updateData,
          })

          successCount++
          console.log(`✓ Migrated comment ${comment.id}`)
        } else {
          console.log(`- Skipped comment ${comment.id} (already migrated)`)
        }
      } catch (error) {
        errorCount++
        console.error(`✗ Failed to migrate comment ${comment.id}:`, error)
      }
    }

    console.log('\n=== Migration Complete ===')
    console.log(`Total comments: ${comments.totalDocs}`)
    console.log(`Successfully migrated: ${successCount}`)
    console.log(`Errors: ${errorCount}`)
    console.log(`Skipped: ${comments.totalDocs - successCount - errorCount}`)
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }

  process.exit(0)
}

// Run migration
migrateComments()
