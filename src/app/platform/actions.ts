'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

async function requireSuperAdmin() {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })
  if (!user || (user as { role?: string }).role !== 'superadmin') {
    redirect('/login')
  }
  return payload
}

// ── Parse domain entries from FormData ────────────────────────────────
// Domains are sent as indexed fields: domains[0].hostname, domains[0].purpose, etc.
function parseDomains(formData: FormData) {
  const domains: Array<{
    hostname: string
    purpose: 'main' | 'club' | 'department'
    scopeId?: string
    verified?: boolean
  }> = []

  let i = 0
  while (formData.has(`domains[${i}].hostname`)) {
    const hostname = (formData.get(`domains[${i}].hostname`) as string)?.trim()
    const purpose = (formData.get(`domains[${i}].purpose`) as string) || 'main'
    const scopeId = (formData.get(`domains[${i}].scopeId`) as string)?.trim() || undefined
    const verified = formData.get(`domains[${i}].verified`) === 'true'

    if (hostname) {
      domains.push({
        hostname,
        purpose: purpose as 'main' | 'club' | 'department',
        scopeId,
        verified,
      })
    }
    i++
  }

  return domains
}

// ── Build institution data from FormData ──────────────────────────────
function buildInstitutionData(formData: FormData) {
  const modules = formData.getAll('enabledModules') as string[]
  const domains = parseDomains(formData)

  return {
    name: formData.get('name') as string,
    code: (formData.get('code') as string).toLowerCase().trim(),
    shortName: (formData.get('shortName') as string) || undefined,
    status: (formData.get('status') as string) || 'trial',
    tier: (formData.get('tier') as string) || 'pilot',
    domains: domains.length > 0 ? domains : [],
    contact: {
      email: (formData.get('contactEmail') as string) || undefined,
      phone: (formData.get('contactPhone') as string) || undefined,
      website: (formData.get('website') as string) || undefined,
      address: (formData.get('address') as string) || undefined,
    },
    settings: {
      enabledModules: (modules.length > 0 ? modules : ['blog']) as unknown as (
        | 'blog'
        | 'events'
        | 'clubs'
        | 'newsletter'
        | 'conosco'
        | 'gallery'
      )[],
      maxUsers: Number(formData.get('maxUsers')) || 0,
      conoscoInstitutionCode: (formData.get('conoscoInstitutionCode') as string) || undefined,
      conoscoApiUrl: (formData.get('conoscoApiUrl') as string) || undefined,
    },
    branding: {
      primaryColor: (formData.get('primaryColor') as string) || '#1a5276',
      accentColor: (formData.get('accentColor') as string) || undefined,
      tagline: (formData.get('tagline') as string) || undefined,
    },
    footerText: (formData.get('footerText') as string) || undefined,
  }
}

export async function createInstitution(formData: FormData) {
  const payload = await requireSuperAdmin()

  try {
    await payload.create({
      collection: 'institutions',
      data: buildInstitutionData(formData) as any,
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to create institution'
    return { error: msg }
  }

  revalidatePath('/platform')
  revalidatePath('/platform/institutions')
  redirect('/platform/institutions')
}

export async function updateInstitution(id: string, formData: FormData) {
  const payload = await requireSuperAdmin()

  try {
    await payload.update({
      collection: 'institutions',
      id,
      data: buildInstitutionData(formData) as any,
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to update institution'
    return { error: msg }
  }

  revalidatePath('/platform')
  revalidatePath('/platform/institutions')
  redirect('/platform/institutions')
}

export async function deleteInstitution(id: string) {
  const payload = await requireSuperAdmin()

  await payload.delete({ collection: 'institutions', id })

  revalidatePath('/platform')
  revalidatePath('/platform/institutions')
}

export async function toggleInstitutionStatus(
  id: string,
  newStatus: 'active' | 'trial' | 'suspended',
) {
  const payload = await requireSuperAdmin()

  await payload.update({
    collection: 'institutions',
    id,
    data: { status: newStatus },
  })

  revalidatePath('/platform/institutions')
}
