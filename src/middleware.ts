import { NextRequest, NextResponse } from 'next/server'

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/editor',
]

// Routes that redirect authenticated users
const authRoutes = [
  '/login',
  '/register'
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('payload-token')?.value

  // Allow Payload admin routes to pass through (Payload handles its own auth)
  if (pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  // Block direct access to /admin/login - force use of /login
  if (pathname === '/admin/login') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Check if route needs authentication
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

  // If accessing protected route without token
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If accessing auth routes with token, redirect to appropriate dashboard via API
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/api/auth/redirect', request.url))
  }

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