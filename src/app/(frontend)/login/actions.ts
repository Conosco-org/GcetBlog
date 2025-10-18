'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { redirect } from 'next/navigation'
import { cookies, headers } from 'next/headers'

export async function loginAction(formData: FormData) {
  const payload = await getPayload({ config })

  const email = formData.get('email') as string
  const password = formData.get('password') as string

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

      // Redirect based on user role
      const user = result.user
      const redirectPath = user.role === 'admin' ? '/admin' : 
                          user.role === 'editor' ? '/editor' : 
                          '/dashboard'
      
      console.log('Login successful - User role:', user.role, 'Redirecting to:', redirectPath)
      redirect(redirectPath)
    } else {
      return { error: 'Invalid credentials' }
    }
  } catch (error) {
    console.error('Login error:', error)
    return { error: 'Invalid email or password' }
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
