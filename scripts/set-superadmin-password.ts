/**
 * Script to reset superadmin user password
 * Run with: npx tsx scripts/set-superadmin-password.ts
 */

import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/backend/payload.config'

async function setSuperadminPassword() {
  console.log('\n=== Setting Superadmin Password ===\n')

  try {
    const payload = await getPayload({ config })

    // Find the superadmin user
    const users = await payload.find({
      collection: 'users',
      where: {
        email: { equals: 'superadmin@gcet.edu.in' },
      },
    })

    if (users.docs.length === 0) {
      console.error('✗ Superadmin user not found!')
      process.exit(1)
    }

    const user = users.docs[0]

    console.log('✓ User found!')
    console.log(`  Name: ${user.name}`)
    console.log(`  Email: ${user.email}`)
    console.log(`  Role: ${user.role}`)
    console.log(`  Is Admin: ${user.isAdmin}\n`)

    // Update the password and ensure account is active
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        password: 'superadmin123',
        isActive: true,
        authProvider: 'local',
      },
      overrideAccess: true,
    })

    console.log('✓ Password set successfully!')
    console.log('\nLogin Credentials:')
    console.log('==================')
    console.log('Email: superadmin@gcet.edu.in')
    console.log('Password: superadmin123')
    console.log('\nYou can now login at: http://localhost:3000/login\n')
  } catch (error) {
    console.error('Error setting password:', error)
    process.exit(1)
  }

  process.exit(0)
}

// Run the script
setSuperadminPassword()
