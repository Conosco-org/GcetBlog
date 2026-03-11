/**
 * Domain Scope Utility — Multi-Tenant Frontend Filtering
 *
 * Determines what content to show based on the domain's purpose.
 * Uses tenant context (set by middleware) to scope frontend rendering.
 *
 * Domain purpose effects:
 *   'main'       → Show everything (posts, clubs, events, pages)
 *   'blog'       → Show only blog content (posts, categories, search)
 *   'club'       → Show only the scoped club (its posts, events, gallery)
 *   'department' → Show only the scoped department's content
 *
 * Usage in server components:
 *   const scope = await getDomainScope()
 *   if (scope.showClubs) { // render clubs section }
 *   if (scope.isClubScoped) { // filter to scope.clubScope }
 */

import { getCurrentTenant, type TenantContext } from '@/utilities/tenantContext'

export interface DomainScope {
  /** The domain purpose */
  purpose: 'main' | 'blog' | 'club' | 'department'

  /** Show blog posts listing */
  showPosts: boolean
  /** Show clubs listing */
  showClubs: boolean
  /** Show events listing */
  showEvents: boolean
  /** Show pages (CMS pages) */
  showPages: boolean

  /** Is this a club-scoped domain (e.g., ieee.gcet.edu.in)? */
  isClubScoped: boolean
  /** The club slug/ID for club-scoped domains */
  clubScope?: string

  /** Is this a department-scoped domain? */
  isDepartmentScoped: boolean
  /** The department code for department-scoped domains */
  departmentScope?: string

  /** The full tenant context (null if no tenant resolved) */
  tenant: TenantContext | null
}

/**
 * Get the domain scope for the current request.
 * Call this in server components to decide what content to render.
 *
 * @example
 * ```tsx
 * const scope = await getDomainScope()
 *
 * // On blog.gcet.edu.in (purpose: 'blog'):
 * // scope.showPosts = true, scope.showClubs = false, scope.showEvents = false
 *
 * // On ieee.gcet.edu.in (purpose: 'club', clubScope: 'ieee'):
 * // scope.isClubScoped = true, scope.clubScope = 'ieee'
 * ```
 */
export async function getDomainScope(): Promise<DomainScope> {
  const tenant = await getCurrentTenant()
  const purpose = tenant?.purpose ?? 'main'

  return buildScope(purpose, tenant)
}

/**
 * Build a DomainScope from a purpose and tenant context.
 * Useful when you already have the tenant and don't want an extra async call.
 */
export function buildScope(
  purpose: DomainScope['purpose'],
  tenant: TenantContext | null,
): DomainScope {
  switch (purpose) {
    case 'blog':
      return {
        purpose: 'blog',
        showPosts: true,
        showClubs: false,
        showEvents: false,
        showPages: false,
        isClubScoped: false,
        isDepartmentScoped: false,
        tenant,
      }

    case 'club':
      return {
        purpose: 'club',
        showPosts: true,
        showClubs: true,
        showEvents: true,
        showPages: true,
        isClubScoped: true,
        clubScope: tenant?.clubScope,
        isDepartmentScoped: false,
        tenant,
      }

    case 'department':
      return {
        purpose: 'department',
        showPosts: true,
        showClubs: true,
        showEvents: true,
        showPages: true,
        isClubScoped: false,
        isDepartmentScoped: true,
        departmentScope: tenant?.clubScope, // reuse clubScope field for dept
        tenant,
      }

    case 'main':
    default:
      return {
        purpose: 'main',
        showPosts: true,
        showClubs: true,
        showEvents: true,
        showPages: true,
        isClubScoped: false,
        isDepartmentScoped: false,
        tenant,
      }
  }
}

/**
 * Navigation items appropriate for the current domain scope.
 * Used by Header to show/hide nav links.
 */
export interface ScopedNavItem {
  label: string
  href: string
  icon?: string
}

export function getNavItemsForScope(scope: DomainScope): ScopedNavItem[] {
  const items: ScopedNavItem[] = []

  if (scope.showPosts) {
    items.push({ label: 'Posts', href: '/posts', icon: 'book-open' })
  }

  if (scope.showClubs && !scope.isClubScoped) {
    items.push({ label: 'Clubs', href: '/clubs', icon: 'users' })
  }

  if (scope.showEvents) {
    items.push({ label: 'Events', href: '/events', icon: 'calendar' })
  }

  return items
}
