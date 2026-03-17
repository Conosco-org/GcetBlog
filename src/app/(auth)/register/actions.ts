'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { redirect } from 'next/navigation'
import { getCurrentTenant } from '@/utilities/tenantContext'

export async function registerAction(formData: FormData) {
  const payload = await getPayload({ config })

  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string
  const bio = formData.get('bio') as string

  if (!name || !email || !password || !confirmPassword) {
    return { error: 'All fields are required' }
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match' }
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters long' }
  }

  // Resolve current tenant — all registrations must be scoped to an institution
  const tenant = await getCurrentTenant()
  if (!tenant) {
    return { error: 'Could not determine institution. Please try again or contact support.' }
  }

  try {
    // Check if user already exists
    const existingUsers = await payload.find({
      collection: 'users',
      where: {
        email: { equals: email },
      },
    })

    if (existingUsers.docs.length > 0) {
      return { error: 'A user with this email already exists' }
    }

    // Create new user — auto-assign institution from current domain's tenant
    await payload.create({
      collection: 'users',
      data: {
        name,
        email,
        password,
        role: 'user',
        bio,
        institution: tenant.institutionId,
      },
    })
  } catch (error) {
    console.error('Registration error:', error)
    return { error: 'Failed to create account. Please try again.' }
  }

  redirect('/login?message=Account created successfully! Please sign in.')
}
