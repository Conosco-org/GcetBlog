'use client'

/**
 * TenantProvider — Client-side Tenant Context (v3 Multi-Tenant)
 *
 * Wraps the app to provide tenant info to client components.
 * Server layout fetches tenant data → passes to this provider.
 *
 * Usage in client components:
 *   const { tenant } = useTenant()
 *   // tenant.code, tenant.institutionId, etc.
 */

import { createContext, useContext, type ReactNode } from 'react'

export interface ClientTenant {
  institutionId: string
  code: string
  name: string
  shortName?: string
  /** Domain purpose — determines what content to show */
  purpose: 'main' | 'blog' | 'club' | 'department'
  clubScope?: string
  branding?: {
    primaryColor?: string
    accentColor?: string
    tagline?: string
  }
}

interface TenantContextValue {
  tenant: ClientTenant | null
}

const TenantContext = createContext<TenantContextValue>({ tenant: null })

export function TenantProvider({
  tenant,
  children,
}: {
  tenant: ClientTenant | null
  children: ReactNode
}) {
  return (
    <TenantContext.Provider value={{ tenant }}>
      {children}
    </TenantContext.Provider>
  )
}

/**
 * Hook to access the current tenant in client components.
 *
 * @example
 * ```tsx
 * 'use client'
 * import { useTenant } from '@/providers/Tenant'
 *
 * export function InstitutionBanner() {
 *   const { tenant } = useTenant()
 *   if (!tenant) return null
 *   return <div>{tenant.name} Blog</div>
 * }
 * ```
 */
export function useTenant(): TenantContextValue {
  return useContext(TenantContext)
}
