'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { redirect } from 'next/navigation'
import { cookies, headers } from 'next/headers'

export async function loginAction(formData: FormData) {
  const payload = await getPayload({ config })

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const redirectTo = formData.get('redirectTo') as string | null

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  try {
    // Authenticate the user
    const result = await payload.login({
      collection: 'users',
      data: {
        email,
        password,
      },
    })

    if (result.token) {
      // Set the token in cookies for authentication
      const cookieStore = await cookies()
      cookieStore.set('payload-token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })

      // Determine redirect path
      const user = result.user
      let redirectPath: string
      
      if (redirectTo && redirectTo.startsWith('/')) {
        // Use the redirect parameter if it's a safe internal path
        redirectPath = redirectTo
      } else {
        // Default role-based redirect
        redirectPath = user.role === 'admin' ? '/admin' : 
                      user.role === 'editor' ? '/editor' : 
                      '/dashboard'
      }
      
      console.log('Login successful - User role:', user.role, 'Redirecting to:', redirectPath)
      
      // Return success with redirect path for client-side handling
      return { success: true, redirectPath }
    } else {
      return { error: 'Invalid credentials' }
    }
  } catch (error) {
    console.error('Login error:', error)
    
    // Provide more specific error messages
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase()
      
      if (errorMessage.includes('credentials')) {
        return { error: 'Invalid email or password. Please try again.' }
      }
      if (errorMessage.includes('user') && errorMessage.includes('not found')) {
        return { error: 'No account found with this email address.' }
      }
      if (errorMessage.includes('password')) {
        return { error: 'Incorrect password. Please try again.' }
      }
      if (errorMessage.includes('locked') || errorMessage.includes('disabled')) {
        return { error: 'Your account has been disabled. Please contact support.' }
      }
    }
    
    return { error: 'Unable to sign in. Please check your credentials and try again.' }
  }
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete('payload-token')
  redirect('/login')
}

export async function logoutWithoutRedirect() {
  const cookieStore = await cookies()
  cookieStore.delete('payload-token')
}

export async function getCurrentUser() {
  try {
    const payload = await getPayload({ config })
    const requestHeaders = await headers()
    const { user } = await payload.auth({ headers: requestHeaders })
    return user || null
  } catch {
    return null
  }
}
