import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { checkPermission } from '@/access/hasPermission'
import { getDepartmentOptions } from '@/custom/departments'
import { DepartmentForm } from './DepartmentForm'

export const metadata = {
  title: 'Create Department | Dashboard',
}

export default async function CreateDepartmentPage() {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()

  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) {
    redirect('/login')
  }

  // Must have club:edit_page permission (institution_admin bypasses; club_admin has it too)
  if (!checkPermission(user, 'club:edit_page')) {
    redirect('/user')
  }

  const departmentOptions = getDepartmentOptions()

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Create New Department</h1>
      <DepartmentForm
        user={{ id: user.id, role: user.role as string }}
        departmentOptions={departmentOptions}
      />
    </div>
  )
}
