import { NextRequest, NextResponse } from 'next/server'

// ---------------------------------------------------------------------------
// Constants for tenant header propagation
// ---------------------------------------------------------------------------

const TENANT_HEADER = 'x-tenant-id'
const TENANT_CODE_HEADER = 'x-tenant-code'
const TENANT_CLUB_SCOPE_HEADER = 'x-tenant-club-scope'
const TENANT_PURPOSE_HEADER = 'x-tenant-purpose'

/** Managed subdomain suffix (pilot tier) */
const PLATFORM_SUBDOMAIN_SUFFIX =
  process.env.PLATFORM_SUBDOMAIN_SUFFIX || 'sites.conosco.in'

// ---------------------------------------------------------------------------
// Lightweight tenant cache (Edge-compatible, no Payload dependency)
// ---------------------------------------------------------------------------

interface TenantCacheEntry {
  institutionId: string
  code: string
  status: string
  purpose?: string
  clubScope?: string
  expiresAt: number
}

const TENANT_CACHE_TTL = 5 * 60 * 1000 // 5 min
const tenantCache = new Map<string, TenantCacheEntry | null>()

/**
 * Resolve hostname to institution via API call (Edge-compatible).
 * Calls /api/resolve-tenant?hostname=... which runs in Node.js runtime.
 */
async function resolveTenantFromHostname(
  hostname: string,
  request: NextRequest,
): Promise<TenantCacheEntry | null> {
  const normalizedHost = hostname.toLowerCase().replace(/:\d+$/, '')

  // Check cache
  const cached = tenantCache.get(normalizedHost)
  if (cached !== undefined) {
    if (cached === null) return null
    if (cached.expiresAt > Date.now()) return cached
  }

  try {
    const apiUrl = new URL('/api/resolve-tenant', request.url)
    apiUrl.searchParams.set('hostname', normalizedHost)
    const res = await fetch(apiUrl.toString())

    if (!res.ok) {
      tenantCache.set(normalizedHost, null)
      return null
    }

    const data = await res.json()
    if (!data.institutionId) {
      tenantCache.set(normalizedHost, null)
      return null
    }

    const entry: TenantCacheEntry = {
      institutionId: data.institutionId,
      code: data.code,
      status: data.status,
      purpose: data.purpose,
      clubScope: data.clubScope,
      expiresAt: Date.now() + TENANT_CACHE_TTL,
    }
    tenantCache.set(normalizedHost, entry)
    return entry
  } catch {
    // If API call fails, don't cache — might be transient
    return null
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface MiddlewareUser {
  role?: string
  institution?: string | { id: string }
  roleAssignments?: Array<{
    assignedRole?: string
    scopeType?: string
    scopeId?: string | { id: string }
  }>
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

/** Check if user is superadmin (platform owner). */
function isSuperAdmin(user: MiddlewareUser): boolean {
  return user.role === 'superadmin'
}

/** Check if user is institution_admin. */
function isInstitutionAdmin(user: MiddlewareUser): boolean {
  return (user.roleAssignments || []).some(
    (a) => a.assignedRole === 'institution_admin',
  )
}

/** Check if user has any role assignment (any scoped role). */
function hasAnyRole(user: MiddlewareUser): boolean {
  return (user.roleAssignments || []).length > 0
}

/** Get the best dashboard URL for a user based on their roles. */
function getDashboardUrl(user: MiddlewareUser): string {
  if (isSuperAdmin(user)) return '/'
  if (hasAnyRole(user)) return '/user'
  return '/' // regular user with no roles — public site only
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('payload-token')?.value
  const hostname = request.headers.get('host') || 'localhost'

  // ── Tenant Resolution ─────────────────────────────────────────────────
  // Resolve hostname → institution for EVERY request (cached, lightweight).
  // Sets x-tenant-id, x-tenant-code headers for downstream server components.
  // Skip for /api/resolve-tenant (the endpoint we call), /platform, /_next, etc.
  const skipTenantPaths = [
    '/api/resolve-tenant',
    '/_next',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
  ]
  const shouldResolveTenant =
    !pathname.startsWith('/platform') &&
    !skipTenantPaths.some((p) => pathname.startsWith(p))

  let tenantInfo: TenantCacheEntry | null = null

  if (shouldResolveTenant) {
    tenantInfo = await resolveTenantFromHostname(hostname, request)

    // If institution is suspended, show a maintenance page (except for platform routes)
    if (tenantInfo?.status === 'suspended') {
      return new NextResponse(
        '<html><body><h1>This site is currently suspended.</h1><p>Please contact the platform administrator.</p></body></html>',
        {
          status: 503,
          headers: { 'Content-Type': 'text/html' },
        },
      )
    }
  }

  // ── Payload admin panel — only superadmin ─────────────────────────────
  // Block /admin/login publicly
  if (pathname === '/admin/login') {
    return new NextResponse(null, { status: 404 })
  }

  // ── /platform/* — Keep for backwards compatibility, redirect to root ──
  if (pathname.startsWith('/platform')) {
    const subPath = pathname.replace('/platform', '') || '/'
    return NextResponse.redirect(new URL(subPath, request.url))
  }

  // ── /user — unified dashboard for all role holders ────────────────────
  if (pathname.startsWith('/user')) {
    if (!token) return loginRedirect(request, { redirect: pathname })

    const user = await getUser(token, request)
    if (!user) return loginRedirect(request, { message: 'Session expired' })

    if (isSuperAdmin(user)) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    if (!hasAnyRole(user)) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // For /user routes, inject tenant headers so server components can scope queries
    const response = NextResponse.next()
    if (tenantInfo) {
      response.headers.set(TENANT_HEADER, tenantInfo.institutionId)
      response.headers.set(TENANT_CODE_HEADER, tenantInfo.code)
      if (tenantInfo.purpose) {
        response.headers.set(TENANT_PURPOSE_HEADER, tenantInfo.purpose)
      }
      if (tenantInfo.clubScope) {
        response.headers.set(TENANT_CLUB_SCOPE_HEADER, tenantInfo.clubScope)
      }
    }
    return response
  }

  // ── /admin-dashboard/* — DEPRECATED, redirect to /user/* ──────────────
  if (pathname.startsWith('/admin-dashboard')) {
    const subPath = pathname.replace('/admin-dashboard', '/user')
    return NextResponse.redirect(new URL(subPath, request.url))
  }

  // ── /admin (Payload panel) — redirect to appropriate dashboard ────────
  if (pathname.startsWith('/admin')) {
    if (!token) return loginRedirect(request)

    const user = await getUser(token, request)
    if (!user) return loginRedirect(request, { message: 'Session expired' })

    return NextResponse.redirect(new URL(getDashboardUrl(user), request.url))
  }

  // ── /editor/* — DEPRECATED, redirect to /user/* ──────────────────────
  if (pathname.startsWith('/editor')) {
    const subPath = pathname.replace('/editor', '/user')
    return NextResponse.redirect(new URL(subPath, request.url))
  }

  // ── /contributor — DEPRECATED, redirect to /user ────────────────────
  if (pathname.startsWith('/contributor')) {
    if (!token) return loginRedirect(request, { redirect: '/user' })

    const user = await getUser(token, request)
    if (!user) return loginRedirect(request, { redirect: '/user' })

    return NextResponse.redirect(new URL(getDashboardUrl(user), request.url))
  }

  // ── Legacy /dashboard routes ──────────────────────────────────────────
  if (pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // ── Root path (/) — Platform dashboard or institution blog ───────────
  // If no tenant resolved (main platform domain), show platform dashboard
  // If tenant resolved (institution domain), show institution blog
  if (pathname === '/') {
    if (!tenantInfo) {
      // No institution resolved → platform context (main platform domain)
      if (!token) {
        // Show the public platform landing page instead of redirecting to login
        return NextResponse.redirect(new URL('/start', request.url))
      }
      
      const user = await getUser(token, request)
      if (!user) {
        return NextResponse.redirect(new URL('/start', request.url))
      }
      
      // Check if user is SuperAdmin
      if (!isSuperAdmin(user)) {
        // Not SuperAdmin → redirect to their appropriate dashboard
        return NextResponse.redirect(new URL(getDashboardUrl(user), request.url))
      }
      
      // SuperAdmin → continue to platform dashboard at root
      return NextResponse.next()
    }
    // Tenant resolved → continue to institution blog home page
  }

  // ── Public routes — require tenant for non-auth pages ────────────────
  // Block access to institution content if no tenant is resolved
  const publicAuthPaths = ['/login', '/register', '/set-password', '/forgot-password']
  const isAuthPath = publicAuthPaths.some(p => pathname.startsWith(p))
  const isPlatformPublicPath = pathname.startsWith('/start')
  
  if (!isAuthPath && !isPlatformPublicPath && !tenantInfo && pathname !== '/') {
    // No tenant resolved and trying to access institution content
    // Redirect to the platform landing page
    return NextResponse.redirect(new URL('/start', request.url))
  }

  // ── Public routes — inject tenant headers ─────────────────────────────
  const response = NextResponse.next()
  if (tenantInfo) {
    response.headers.set(TENANT_HEADER, tenantInfo.institutionId)
    response.headers.set(TENANT_CODE_HEADER, tenantInfo.code)
    if (tenantInfo.purpose) {
      response.headers.set(TENANT_PURPOSE_HEADER, tenantInfo.purpose)
    }
    if (tenantInfo.clubScope) {
      response.headers.set(TENANT_CLUB_SCOPE_HEADER, tenantInfo.clubScope)
    }
  }
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes) — except resolve-tenant which MUST be excluded above
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public assets)
     * - media (media files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public|media).*)',
  ],
}