import { NextRequest, NextResponse } from 'next/server'

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('payload-token')?.value

  // Block direct access to /admin/login - force use of /login
  if (pathname === '/admin/login') {
    return new NextResponse(null, { status: 404 })
  }

  // Require authentication AND admin role for /admin routes
  if (pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    // Verify user role by calling /api/users/me
    try {
      const apiUrl = new URL('/api/users/me', request.url)
      const meResponse = await fetch(apiUrl, {
        headers: {
          Cookie: `payload-token=${token}`,
        },
      })

      if (!meResponse.ok) {
        // Token invalid or expired, redirect to login
        return NextResponse.redirect(new URL('/login?message=Session expired', request.url))
      }

      const { user } = await meResponse.json()

      // Only admins can access /admin routes
      if (user?.role !== 'admin') {
        // Redirect non-admins to their appropriate dashboard
        const redirectUrl = user?.role === 'editor' ? '/editor' : '/dashboard'
        return NextResponse.redirect(new URL(redirectUrl, request.url))
      }

      // Admin verified, allow access
      return NextResponse.next()
    } catch (error) {
      console.error('Error verifying admin access:', error)
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Require authentication AND editor/admin role for /editor routes
  if (pathname.startsWith('/editor')) {
    if (!token) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Verify user role by calling /api/users/me
    try {
      const apiUrl = new URL('/api/users/me', request.url)
      const meResponse = await fetch(apiUrl, {
        headers: {
          Cookie: `payload-token=${token}`,
        },
      })

      if (!meResponse.ok) {
        // Token invalid or expired, redirect to login
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('message', 'Session expired')
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
      }

      const { user } = await meResponse.json()

      // Only editors and admins can access /editor routes
      if (user?.role !== 'editor' && user?.role !== 'admin') {
        // Redirect contributors to their dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }

      // Editor/Admin verified, allow access
      return NextResponse.next()
    } catch (error) {
      console.error('Error verifying editor access:', error)
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Require authentication AND contributor role for /contributor routes
  if (pathname.startsWith('/contributor')) {
    if (!token) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Verify user role by calling /api/users/me
    try {
      const apiUrl = new URL('/api/users/me', request.url)
      const meResponse = await fetch(apiUrl, {
        headers: {
          Cookie: `payload-token=${token}`,
        },
      })

      if (!meResponse.ok) {
        // Token invalid or expired, redirect to login
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('message', 'Session expired')
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
      }

      const { user } = await meResponse.json()

      // Only contributors can access /contributor routes
      if (user?.role !== 'contributor') {
        // Redirect to appropriate dashboard
        const redirectUrl = user?.role === 'admin' ? '/admin' : user?.role === 'editor' ? '/editor' : '/dashboard/user'
        return NextResponse.redirect(new URL(redirectUrl, request.url))
      }

      // Contributor verified, allow access
      return NextResponse.next()
    } catch (error) {
      console.error('Error verifying contributor access:', error)
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Redirect old /dashboard/contributor routes to new /contributor
  if (pathname.startsWith('/dashboard/contributor')) {
    const newPath = pathname.replace('/dashboard/contributor', '/contributor')
    return NextResponse.redirect(new URL(newPath, request.url))
  }

  // Check if route needs authentication
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // If accessing protected route without token
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Don't handle auth route redirects in middleware - let the page component handle it
  // This avoids conflicts with server action redirects from loginAction
  // The login page itself checks getCurrentUser() and redirects appropriately

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public assets)
     * - media (media files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public|media).*)',
  ],
}