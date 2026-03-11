import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { InstitutionForm } from '../../components/InstitutionForm'

export const dynamic = 'force-dynamic'

export default async function NewInstitutionPage() {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user || (user as { role?: string }).role !== 'superadmin') {
    redirect('/login')
  }

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

      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">New Institution</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Create a new institution on the platform.
        </p>
      </div>

      <InstitutionForm />
    </div>
  )
}
