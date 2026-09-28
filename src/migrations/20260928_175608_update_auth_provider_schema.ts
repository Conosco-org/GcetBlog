import { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-mongodb'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = (payload.db as any).connection?.db
  if (!db) {
    payload.logger.warn('Could not access raw MongoDB connection')
    return
  }

  const users = await db.collection('users').find({}).toArray()

  for (const user of users) {
    if (user.authProvider !== undefined) {
      let newProviders = ['local']
      if (user.authProvider === 'local') newProviders = ['local']
      else if (user.authProvider === 'google') newProviders = ['google']
      else if (user.authProvider === 'both') newProviders = ['local', 'google']

      await db.collection('users').updateOne(
        { _id: user._id },
        { 
          $set: { linkedProviders: newProviders },
          $unset: { authProvider: '' }
        }
      )
    } else if (user.linkedProviders === undefined) {
       await db.collection('users').updateOne(
         { _id: user._id },
         { $set: { linkedProviders: ['local'] } }
       )
    }
  }
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = (payload.db as any).connection?.db
  if (!db) {
    return
  }

  const users = await db.collection('users').find({}).toArray()

  for (const user of users) {
    if (user.linkedProviders !== undefined) {
      const providers = user.linkedProviders as string[]
      let oldProvider = 'local'

      if (providers.includes('local') && providers.includes('google')) oldProvider = 'both'
      else if (providers.includes('google')) oldProvider = 'google'
      else oldProvider = 'local'

      await db.collection('users').updateOne(
        { _id: user._id },
        { 
          $set: { authProvider: oldProvider },
          $unset: { linkedProviders: '' }
        }
      )
    }
  }
}
