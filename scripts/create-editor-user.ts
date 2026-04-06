/**
 * Script to create an editor user for local development
 * Run with: npx tsx scripts/create-editor-user.ts
 */

import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'

async function createEditorUser() {
  console.log('Creating editor user...')

  try {
    const payload = await getPayload({ config })

    // Check if user already exists
    const existingUsers = await payload.find({
      collection: 'users',
      where: {
        email: { equals: 'editor@gcet.edu.in' },
      },
    })

    if (existingUsers.docs.length > 0) {
      console.log('✓ Editor user already exists!')
      console.log('Email: editor@gcet.edu.in')
      console.log('You can reset the password if needed.')
      
      // Update the existing user to ensure it has editor role
      await payload.update({
        collection: 'users',
        id: existingUsers.docs[0].id,
        data: {
          role: 'editor',
        },
      })
      console.log('✓ Updated user role to editor')
    } else {
      // Create new editor user
      const user = await payload.create({
        collection: 'users',
        data: {
          email: 'editor@gcet.edu.in',
          password: 'editor123',
          name: 'Editor User',
          role: 'editor',
        },
      })

      console.log('✓ Editor user created successfully!')
      console.log('Email: editor@gcet.edu.in')
      console.log('Password: editor123')
      console.log('Role: editor')
      console.log(`User ID: ${user.id}`)
    }

    console.log('\nYou can now login at: http://localhost:3000/login')
  } catch (error) {
    console.error('Error creating editor user:', error)
    process.exit(1)
  }

  process.exit(0)
}

// Run the script
createEditorUser()
