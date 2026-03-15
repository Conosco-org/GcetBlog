/**
 * Tenant Resolver — Multi-Tenant Architecture (v3)
 *
 * Resolves hostname → institution. Used by middleware and server components.
 *
 * Resolution strategy:
 *   1. Check `domains` array on Institutions collection for exact hostname match
 *   2. Check `{code}.sites.conosco.in` subdomain pattern (pilot tier)
 *   3. Fallback to default institution (env var or first active institution)
 *
 * Domain mapping examples:
 *   blog.gcet.edu.in    → instituteId = 'gcet'            (custom domain, main site)
 *   ieee.gcet.edu.in    → instituteId = 'gcet', club=ieee (custom domain, club scope)
 *   gcet.sites.conosco.in → instituteId = 'gcet'          (pilot subdomain)
 *   localhost:3000       → instituteId from DEFAULT_INSTITUTION_CODE env
 *
 * Caching: In-memory cache (TTL 5 min) avoids DB lookups per request.
 */
import type { BasePayload } from 'payload'
import type { Institution } from '@/payload-types'

export interface ResolvedTenant {
  /** The institution document ID (MongoDB ObjectId) */
  institutionId: string
  /** The institution's unique code (e.g., 'gcet') */
  code: string
  /** Full institution name */
  name: string
  /** Short display name (e.g., 'GCET') */
  shortName?: string
  /** Institution status */
  status: 'active' | 'trial' | 'suspended'
  /** Subscription tier */
  tier: 'pilot' | 'standard' | 'premium'
  /** Domain purpose — determines content filtering */
  purpose: 'main' | 'blog' | 'club' | 'department'
  /** If the domain is a club-scoped domain, this is the club slug */
  clubScope?: string
  /** If the domain is a department-scoped domain */
  departmentScope?: string
  /** Enabled modules for this institution */
  enabledModules?: string[]
  /** Conosco API URL (per-institution) */
  conoscoApiUrl?: string
  /** Branding */
  branding?: {
    primaryColor?: string
    accentColor?: string
    tagline?: string
    favicon?: {
      url?: string
    }
  }
}

// ---------------------------------------------------------------------------
// In-memory cache (cleared on redeploy, TTL 5 min)
// ---------------------------------------------------------------------------

interface CacheEntry {
  tenant: ResolvedTenant | null
  expiresAt: number
}

const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes
const hostnameCache = new Map<string, CacheEntry>()

/** Clear the tenant cache (call after institution update) */
export function clearTenantCache(hostname?: string): void {
  if (hostname) {
    hostnameCache.delete(hostname)
  } else {
    hostnameCache.clear()
  }
}

// ---------------------------------------------------------------------------
// Subdomain parsing helpers
// ---------------------------------------------------------------------------

/** The platform's managed subdomain suffix (e.g., 'sites.conosco.in') */
const PLATFORM_SUBDOMAIN_SUFFIX =
  process.env.PLATFORM_SUBDOMAIN_SUFFIX || 'sites.conosco.in'

/**
 * Parse a pilot subdomain: `{code}.sites.conosco.in` → code
 */
function parsePilotSubdomain(hostname: string): string | null {
  const lower = hostname.toLowerCase()
  if (!lower.endsWith(`.${PLATFORM_SUBDOMAIN_SUFFIX}`)) return null
  const prefix = lower.slice(0, -(PLATFORM_SUBDOMAIN_SUFFIX.length + 1))
  // prefix should be a single segment (no dots)
  if (!prefix || prefix.includes('.')) return null
  return prefix
}

// ---------------------------------------------------------------------------
// Core resolver
// ---------------------------------------------------------------------------

/**
 * Resolve a hostname to a tenant (institution).
 *
 * This function hits the database directly (via payload.find).
 * For middleware (Edge Runtime), use `resolveFromHeaders` instead.
 *
 * @param hostname - The request hostname (e.g., 'blog.gcet.edu.in')
 * @param payload - Payload instance (from getPayload)
 * @returns ResolvedTenant or null if no match
 */
export async function resolveTenant(
  hostname: string,
  payload: BasePayload,
): Promise<ResolvedTenant | null> {
  const normalizedHost = hostname.toLowerCase().replace(/:\d+$/, '') // strip port

  // Check cache
  const cached = hostnameCache.get(normalizedHost)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.tenant
  }

  let tenant: ResolvedTenant | null = null

  // Strategy 1: Exact domain match in institutions.domains[] array
  tenant = await resolveByCustomDomain(normalizedHost, payload)

  // Strategy 2: Pilot subdomain pattern ({code}.sites.conosco.in)
  if (!tenant) {
    tenant = await resolveByPilotSubdomain(normalizedHost, payload)
  }

  // Strategy 3: Localhost / development fallback (ONLY if DEFAULT_INSTITUTION_CODE is explicitly set)
  // This allows testing institution sites locally without hosts file modification
  if (!tenant && isLocalhost(normalizedHost) && process.env.DEFAULT_INSTITUTION_CODE) {
    tenant = await resolveByDefault(payload)
  }

  // Cache result (even null — to avoid repeated misses)
  hostnameCache.set(normalizedHost, {
    tenant,
    expiresAt: Date.now() + CACHE_TTL_MS,
  })

  return tenant
}

/**
 * Resolve by custom domain match (looks for hostname in institutions.domains[].hostname).
 */
async function resolveByCustomDomain(
  hostname: string,
  payload: BasePayload,
): Promise<ResolvedTenant | null> {
  const result = await payload.find({
    collection: 'institutions',
    where: {
      'domains.hostname': { equals: hostname },
      status: { not_equals: 'suspended' },
    },
    limit: 1,
    depth: 0,
  })

  if (result.docs.length === 0) return null

  const inst = result.docs[0]

  // Find the matching domain entry for scope info
  const matchedDomain = inst.domains?.find(
    (d) => d.hostname.toLowerCase() === hostname,
  )

  return buildTenantFromDoc(inst, matchedDomain)
}

/**
 * Resolve by pilot subdomain pattern ({code}.sites.conosco.in).
 */
async function resolveByPilotSubdomain(
  hostname: string,
  payload: BasePayload,
): Promise<ResolvedTenant | null> {
  const code = parsePilotSubdomain(hostname)
  if (!code) return null

  const result = await payload.find({
    collection: 'institutions',
    where: {
      code: { equals: code },
      status: { not_equals: 'suspended' },
    },
    limit: 1,
    depth: 0,
  })

  if (result.docs.length === 0) return null
  return buildTenantFromDoc(result.docs[0])
}

/**
 * Fallback: resolve to the default institution (env var or first active).
 */
async function resolveByDefault(
  payload: BasePayload,
): Promise<ResolvedTenant | null> {
  const defaultCode = process.env.DEFAULT_INSTITUTION_CODE

  const result = await payload.find({
    collection: 'institutions',
    where: defaultCode
      ? { code: { equals: defaultCode }, status: { not_equals: 'suspended' } }
      : { status: { not_equals: 'suspended' } },
    limit: 1,
    depth: 0,
  })

  if (result.docs.length === 0) return null
  return buildTenantFromDoc(result.docs[0])
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isLocalhost(hostname: string): boolean {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.') ||
    hostname.endsWith('.local')
  )
}

function buildTenantFromDoc(
  doc: Institution,
  matchedDomain?: { purpose: string; scopeId?: string | null },
): ResolvedTenant {
  const purpose = (matchedDomain?.purpose ?? 'main') as ResolvedTenant['purpose']
  return {
    institutionId: doc.id,
    code: doc.code,
    name: doc.name,
    shortName: doc.shortName ?? undefined,
    status: doc.status || 'trial',
    tier: doc.tier || 'pilot',
    purpose,
    clubScope:
      purpose === 'club' ? (matchedDomain?.scopeId ?? undefined) : undefined,
    departmentScope:
      purpose === 'department'
        ? (matchedDomain?.scopeId ?? undefined)
        : undefined,
    enabledModules: (doc.settings?.enabledModules as string[] | undefined) ?? undefined,
    conoscoApiUrl: doc.settings?.conoscoApiUrl ?? undefined,
    branding: doc.branding
      ? {
          primaryColor: doc.branding.primaryColor ?? undefined,
          accentColor: doc.branding.accentColor ?? undefined,
          tagline: doc.branding.tagline ?? undefined,
          favicon: doc.branding.favicon
            ? {
                url: typeof doc.branding.favicon === 'string'
                  ? undefined
                  : (doc.branding.favicon as { url?: string })?.url,
              }
            : undefined,
        }
      : undefined,
  }
}

// ---------------------------------------------------------------------------
// Header-based resolution (for server components / route handlers)
// ---------------------------------------------------------------------------

/**
 * Custom header name set by middleware to propagate tenant info.
 * Avoids re-querying DB in server components after middleware resolved it.
 */
export const TENANT_HEADER = 'x-tenant-id'
export const TENANT_CODE_HEADER = 'x-tenant-code'
export const TENANT_CLUB_SCOPE_HEADER = 'x-tenant-club-scope'
export const TENANT_PURPOSE_HEADER = 'x-tenant-purpose'

/**
 * Read tenant info from headers (set by middleware).
 * Returns partial tenant info — enough for server components to scope queries.
 */
export function getTenantFromHeaders(
  headersFn: () => { get: (name: string) => string | null },
): { institutionId: string; code: string; clubScope?: string } | null {
  const hdrs = headersFn()
  const id = hdrs.get(TENANT_HEADER)
  const code = hdrs.get(TENANT_CODE_HEADER)
  if (!id || !code) return null
  return {
    institutionId: id,
    code,
    clubScope: hdrs.get(TENANT_CLUB_SCOPE_HEADER) || undefined,
  }
}
