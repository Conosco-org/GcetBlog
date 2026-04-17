import dotenv from 'dotenv'

// Load environment variables FIRST before any imports
dotenv.config()

import { getPayload } from 'payload'
import config from '../src/backend/payload.config'

async function checkSuperadminStatus() {
  try {
    const payload = await getPayload({ config })

    console.log('\n=== Checking Superadmin Account Status ===\n')

    // Find the superadmin user
    const result = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: 'superadmin@gcet.edu.in',
        },
      },
      limit: 1,
    })

    if (result.docs.length === 0) {
      console.log('❌ User not found: superadmin@gcet.edu.in')
      console.log('\nThe account does not exist in the database.')
      return
    }

    const user = result.docs[0]

    console.log('✅ User found!')
    console.log('\nAccount Details:')
    console.log('================')
    console.log(`Email: ${user.email}`)
    console.log(`Name: ${user.name}`)
    console.log(`Role: ${user.role}`)
    console.log(`Is Admin: ${user.isAdmin}`)
    console.log(`Can Manage Admins: ${user.canManageAdmins}`)
    console.log(`Is Active: ${user.isActive}`)
    console.log(`Auth Provider: ${user.authProvider}`)
    
    if (user.deactivatedAt) {
      console.log(`Deactivated At: ${user.deactivatedAt}`)
    }
    if (user.deactivatedBy) {
      console.log(`Deactivated By: ${user.deactivatedBy}`)
    }

    console.log('\nLogin Status:')
    console.log('=============')
    if (user.isActive === false) {
      console.log('❌ Account is DISABLED')
      console.log('   The user cannot login because isActive is false')
    } else if (user.isActive === true) {
      console.log('✅ Account is ACTIVE')
      console.log('   The user should be able to login')
    } else if (user.isActive === null || user.isActive === undefined) {
      console.log('⚠️  isActive field is NULL or UNDEFINED')
      console.log('   This might be treated as false by the beforeLogin hook')
      console.log('   Need to set isActive to true explicitly')
    }

    // Check if password is set
    if (user.password) {
      console.log('\n✅ Password is set')
    } else {
      console.log('\n❌ No password set (might be Google-only account)')
    }

    console.log('\n')

  } catch (error) {
    console.error('Error checking user status:', error)
  } finally {
    process.exit(0)
  }
}

checkSuperadminStatus()
