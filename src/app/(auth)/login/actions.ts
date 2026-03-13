'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getCurrentTenant } from '@/utilities/tenantContext'
import type { Institution } from '@/payload-types'

export async function loginAction(formData: FormData) {
  const payload = await getPayload({ config })

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const redirectTo = formData.get('redirectTo') as string | null

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  try {
    // Authenticate the user (password check only — no institution check yet)
    const result = await payload.login({
      collection: 'users',
      data: { email, password },
    })

    if (!result.token) {
      return { error: 'Invalid credentials' }
    }

    const user = result.user
    const isSuperAdmin = (user as { role?: string }).role === 'superadmin'

    // --- Institution scope check (superadmin bypasses all institution checks) ---
    if (!isSuperAdmin) {
      const tenant = await getCurrentTenant()

      if (tenant) {
        const userInstitutionRaw = (user as { institution?: string | Institution | null }).institution
        const userInstitutionId =
          typeof userInstitutionRaw === 'string'
            ? userInstitutionRaw
            : (userInstitutionRaw as Institution | null)?.id ?? null

        if (!userInstitutionId) {
          return {
            error:
              'Your account is not associated with any institution. Please contact support.',
          }
        }

        if (userInstitutionId !== tenant.institutionId) {
          // Look up the correct institution to show a helpful redirect message
          try {
            const correctInst = (await payload.findByID({
              collection: 'institutions',
              id: userInstitutionId,
              depth: 0,
            })) as Institution
            const mainHostname = correctInst.domains?.find((d) => d.purpose === 'main')?.hostname
            const correctLoginUrl = mainHostname ? `https://${mainHostname}/login` : null
            const institutionName = correctInst.shortName || correctInst.name
            return {
              error: `This account belongs to ${institutionName}. ${correctLoginUrl ? `Please login at ${mainHostname}/login` : 'Please use the correct institution login page.'}`,
              correctLoginUrl,
              correctInstitutionName: institutionName,
            }
          } catch {
            return { error: 'Your account does not belong to this institution.' }
          }
        }
      }
    }

    // Set the auth cookie
    const cookieStore = await cookies()
    cookieStore.set('payload-token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    // Determine redirect path
    let redirectPath: string
    if (redirectTo && redirectTo.startsWith('/')) {
      redirectPath = redirectTo
    } else {
      const u = user as { role?: string; roleAssignments?: Array<{ assignedRole: string }> }
      if (u.role === 'superadmin') {
        redirectPath = '/platform'
      } else {
        const hasAnyRole = Array.isArray(u.roleAssignments) && u.roleAssignments.length > 0
        redirectPath = hasAnyRole ? '/user' : '/'
      }
    }

    console.log('Login successful - role:', (user as { role?: string })?.role, '→', redirectPath)
    return { success: true, redirectPath }
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
