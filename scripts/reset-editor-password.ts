/**
 * Script to reset editor user password for local development
 * Run with: npx tsx scripts/reset-editor-password.ts
 */

import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'

async function resetEditorPassword() {
  console.log('Resetting editor password...')

  try {
    const payload = await getPayload({ config })

    // Find the editor user
    const users = await payload.find({
      collection: 'users',
      where: {
        email: { equals: 'editor@gcet.edu.in' },
      },
    })

    if (users.docs.length === 0) {
      console.error('✗ Editor user not found!')
      console.log('Run: npx tsx scripts/create-editor-user.ts first')
      process.exit(1)
    }

    const user = users.docs[0]

    // Update the password
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        password: 'editor123',
      },
    })

    console.log('✓ Password reset successfully!')
    console.log('\nLogin credentials:')
    console.log('Email: editor@gcet.edu.in')
    console.log('Password: editor123')
    console.log('Role:', user.role)
    console.log('\nLogin at: http://localhost:3000/login')
  } catch (error) {
    console.error('Error resetting password:', error)
    process.exit(1)
  }

  process.exit(0)
}

// Run the script
resetEditorPassword()
