'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

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
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })

      // Redirect based on user role
      const user = result.user
      if (user.role === 'admin') {
        redirect('/dashboard/admin')
      } else if (user.role === 'editor') {
        redirect('/editor/queue')
      } else if (user.role === 'contributor') {
        redirect('/dashboard')
      } else {
        redirect('/dashboard')
      }
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

export async function getCurrentUser() {
  const payload = await getPayload({ config })
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')

  if (!token) {
    return null
  }

  try {
    const result = await payload.auth({
      headers: new Headers({
        Authorization: `JWT ${token.value}`,
      }),
    })

    return result.user || null
  } catch (error) {
    console.error('Auth error:', error)
    return null
  }
}
