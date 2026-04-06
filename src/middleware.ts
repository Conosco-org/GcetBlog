import { NextRequest, NextResponse } from 'next/server'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface MiddlewareUser {
  role?: string
  isAdmin?: boolean
}

/**
 * Fetch the current user from /api/users/me using the payload-token cookie.
 * Returns null when the token is missing / invalid / expired.
 */
async function getUser(
  token: string,
  request: NextRequest,
): Promise<MiddlewareUser | null> {
  try {
    const apiUrl = new URL('/api/users/me', request.url)
    const res = await fetch(apiUrl, {
      headers: { Cookie: `payload-token=${token}` },
    })
    if (!res.ok) return null
    const { user } = await res.json()
    return user ?? null
  } catch {
    return null
  }
}

/** Build a login redirect, preserving the original path if supplied. */
function loginRedirect(
  request: NextRequest,
  opts?: { message?: string; redirect?: string },
): NextResponse {
  const url = new URL('/login', request.url)
  if (opts?.message) url.searchParams.set('message', opts.message)
  if (opts?.redirect) url.searchParams.set('redirect', opts.redirect)
  return NextResponse.redirect(url)
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('payload-token')?.value

  // -- Payload admin panel is disabled for everyone ----------------------
  // Block /admin/login and redirect /admin to appropriate dashboard
  if (pathname === '/admin/login') {
    return new NextResponse(null, { status: 404 })
  }

  // -- /admin-dashboard - requires isAdmin flag -------------------------
  // (Must come BEFORE the /admin check since /admin-dashboard starts with /admin)
  if (pathname.startsWith('/admin-dashboard')) {
    if (!token) return loginRedirect(request)

    const user = await getUser(token, request)
    if (!user) return loginRedirect(request, { message: 'Session expired' })

    if (!user.isAdmin) {
      const dest = user.role === 'editor' ? '/editor' : '/contributor'
      return NextResponse.redirect(new URL(dest, request.url))
    }

    return NextResponse.next()
  }

  // -- /admin (Payload panel) - redirect to appropriate dashboard -------
  if (pathname.startsWith('/admin')) {
    if (!token) return loginRedirect(request)

    const user = await getUser(token, request)
    if (!user) return loginRedirect(request, { message: 'Session expired' })

    // Redirect to appropriate dashboard based on permissions
    if (user.isAdmin) {
      return NextResponse.redirect(new URL('/admin-dashboard', request.url))
    } else if (user.role === 'editor') {
      return NextResponse.redirect(new URL('/editor', request.url))
    } else {
      return NextResponse.redirect(new URL('/contributor', request.url))
    }
  }

  // -- /editor - requires role === 'editor' -----------------------------
  // Contributors are allowed on /editor/posts/*/edit (own-post editing).
  if (pathname.startsWith('/editor')) {
    if (!token) return loginRedirect(request, { redirect: pathname })

    const user = await getUser(token, request)
    if (!user) {
      return loginRedirect(request, { message: 'Session expired', redirect: pathname })
    }

    // Allow contributors to edit their own posts via the editor UI
    const isPostEditRoute = /^\/editor\/posts\/[^/]+\/edit/.test(pathname)
    if (user.role === 'contributor' && isPostEditRoute) {
      return NextResponse.next()
    }

    // Only editors (which includes admins, since admins are editors) can
    // access the rest of /editor.
    if (user.role !== 'editor') {
      return NextResponse.redirect(new URL('/contributor', request.url))
    }

    return NextResponse.next()
  }

  // -- /contributor - requires role === 'contributor' --------------------
  if (pathname.startsWith('/contributor')) {
    if (!token) return loginRedirect(request, { redirect: pathname })

    const user = await getUser(token, request)
    if (!user) {
      return loginRedirect(request, { message: 'Session expired', redirect: pathname })
    }

    if (user.role !== 'contributor') {
      const dest = user.role === 'editor' ? '/editor' : '/contributor'
      return NextResponse.redirect(new URL(dest, request.url))
    }

    return NextResponse.next()
  }

  // -- Legacy /dashboard routes ------------------------------------------
  if (pathname.startsWith('/dashboard/contributor')) {
    const newPath = pathname.replace('/dashboard/contributor', '/contributor')
    return NextResponse.redirect(new URL(newPath, request.url))
  }
  if (pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Don't handle auth route redirects in middleware - the login page
  // itself calls getCurrentUser() and redirects appropriately.

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
