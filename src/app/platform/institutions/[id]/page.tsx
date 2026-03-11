import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { InstitutionForm } from '../../components/InstitutionForm'
import type { Institution } from '@/payload-types'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditInstitutionPage({ params }: Props) {
  const { id } = await params
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user || (user as { role?: string }).role !== 'superadmin') {
    redirect('/login')
  }

  let institution: Institution
  try {
    institution = (await payload.findByID({
      collection: 'institutions',
      id,
      depth: 0,
    })) as Institution
  } catch {
    notFound()
  }

  const memberCount = await payload.count({
    collection: 'users',
    where: { institution: { equals: id } },
  })

  const modules =
    (institution.settings as { enabledModules?: string[] } | undefined)?.enabledModules ?? []
  const settings = institution.settings as {
    enabledModules?: string[]
    maxUsers?: number
    conoscoInstitutionCode?: string
    conoscoApiUrl?: string
  } | undefined
  const branding = institution.branding as {
    primaryColor?: string
    accentColor?: string
    tagline?: string
  } | undefined
  const domains = (institution.domains as Array<{
    hostname: string
    purpose: 'main' | 'blog' | 'club' | 'department'
    scopeId?: string
    verified?: boolean
  }>) ?? []

  const statusLabel =
    institution.status === 'active'
      ? 'Active'
      : institution.status === 'suspended'
        ? 'Suspended'
        : 'Trial'
  const statusVariant =
    institution.status === 'active'
      ? 'default'
      : institution.status === 'suspended'
        ? 'destructive'
        : ('secondary' as const)

  return (
    <div className="p-6 max-w-3xl">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/platform/institutions"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Institutions
        </Link>
      </div>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{institution.name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
              {institution.code}
            </code>
            <Badge variant={statusVariant}>{statusLabel}</Badge>
            {institution.tier && (
              <Badge variant="outline" className="text-xs capitalize">
                {institution.tier}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-muted px-3 py-1.5 rounded-lg">
          <Users className="h-4 w-4" />
          {memberCount.totalDocs} member{memberCount.totalDocs !== 1 ? 's' : ''}
        </div>
      </div>

      <InstitutionForm
        institution={{
          id: String(institution.id),
          name: institution.name,
          code: institution.code,
          shortName: institution.shortName as string | undefined,
          status: (institution.status as string) ?? 'trial',
          tier: (institution.tier as string) ?? 'pilot',
          domains,
          contact: institution.contact as {
            email?: string
            phone?: string
            website?: string
            address?: string
          } | undefined,
          settings: {
            enabledModules: modules,
            maxUsers: settings?.maxUsers,
            conoscoInstitutionCode: settings?.conoscoInstitutionCode,
            conoscoApiUrl: settings?.conoscoApiUrl,
          },
          branding: {
            primaryColor: branding?.primaryColor,
            accentColor: branding?.accentColor,
            tagline: branding?.tagline,
          },
          footerText: institution.footerText as string | undefined,
        }}
      />
    </div>
  )
}
