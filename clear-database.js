/**
 * Database Clearing Script
 * Run this to clear all editor dashboard data from MongoDB
 * Usage: node clear-database.js
 */

const { getPayload } = require('payload')
const config = require('./dist/payload.config.js').default

async function clearDatabase() {
  console.log('🔄 Connecting to database...')
  
  const payload = await getPayload({ config })
  
  console.log('🗑️  Clearing posts...')
  const deletedPosts = await payload.delete({
    collection: 'posts',
    where: {},
  })
  console.log(`   ✅ Deleted ${deletedPosts.docs.length} posts`)
  
  console.log('🗑️  Clearing comments...')
  const deletedComments = await payload.delete({
    collection: 'comments',
    where: {},
  })
  console.log(`   ✅ Deleted ${deletedComments.docs.length} comments`)
  
  console.log('🗑️  Clearing media...')
  const deletedMedia = await payload.delete({
    collection: 'media',
    where: {},
  })
  console.log(`   ✅ Deleted ${deletedMedia.docs.length} media files`)
  
  console.log('🗑️  Clearing admin logs...')
  const deletedLogs = await payload.delete({
    collection: 'admin-logs',
    where: {},
  })
  console.log(`   ✅ Deleted ${deletedLogs.docs.length} admin logs`)
  
  console.log('\n✨ Database cleared successfully!')
  console.log('📊 Editor dashboard will now show empty states with all queries intact.')
  
  process.exit(0)
}

clearDatabase().catch((error) => {
  console.error('❌ Error clearing database:', error)
  process.exit(1)
})
