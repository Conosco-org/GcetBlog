import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const requestHeaders = await headers()
    
    const { user } = await payload.auth({ headers: requestHeaders })

    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const typedUser = user as { role?: string }
    const role = typedUser.role || 'contributor'

    // Redirect based on role
    switch (role) {
      case 'admin':
        return NextResponse.redirect(new URL('/admin', request.url))
      case 'editor':
        return NextResponse.redirect(new URL('/editor', request.url))
      case 'contributor':
      default:
        return NextResponse.redirect(new URL('/', request.url))
    }
  } catch (_error) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
}
