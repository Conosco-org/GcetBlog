'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { isRedirectError } from 'next/dist/client/components/redirect-error'

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

  try {
    // Check if user already exists
    const existingUsers = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: email,
        },
      },
    })

    if (existingUsers.docs.length > 0) {
      return { error: 'A user with this email already exists' }
    }

    // Create new user with contributor role
    const user = await payload.create({
      collection: 'users',
      data: {
        name,
        email,
        password,
        role: 'contributor',
        bio,
      },
    })

    if (user) {
      // Auto-login newly created contributors and route to their workspace.
      const loginResult = await payload.login({
        collection: 'users',
        data: {
          email,
          password,
        },
      })

      if (!loginResult.token) {
        return { error: 'Account created, but sign-in failed. Please log in manually.' }
      }

      const cookieStore = await cookies()
      cookieStore.set('payload-token', loginResult.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      })

      redirect('/contributor')
    } else {
      return { error: 'Failed to create account' }
    }
  } catch (error) {
    if (isRedirectError(error)) {
      throw error
    }

    console.error('Registration error:', error)
    return { error: 'Failed to create account. Please try again.' }
  }
}
