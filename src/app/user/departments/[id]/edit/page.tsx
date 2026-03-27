import { redirect, notFound } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { checkPermission } from '@/access/hasPermission'
import { getDepartmentOptions } from '@/custom/departments'
import { lexicalToHtml } from '@/components/RichTextEditor/lexicalToHtml'
import { DepartmentForm } from '../../create/DepartmentForm'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditDepartmentPage({ params }: PageProps) {
  const { id } = await params
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()

  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) {
    redirect('/login')
  }

  if (!checkPermission(user, 'club:edit_page')) {
    redirect('/user')
  }

  let dept
  try {
    dept = await payload.findByID({
      collection: 'departments',
      id,
      draft: true,
      depth: 1,
    })
  } catch {
    notFound()
  }

  if (!dept) notFound()

  // Convert Lexical content to HTML for the editor
  let descriptionHtml = ''
  if (dept.editorialDescription) {
    try {
      descriptionHtml = lexicalToHtml(dept.editorialDescription as Parameters<typeof lexicalToHtml>[0])
    } catch {
      descriptionHtml = ''
    }
  }

  const hod = dept.hod as { name?: string; email?: string; designation?: string } | undefined
  const social = dept.socialLinks as { website?: string; instagram?: string; linkedin?: string } | undefined
  const theme = (dept as unknown as { theme?: { primaryColor?: string; accentColor?: string } }).theme

  const departmentOptions = getDepartmentOptions()

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Edit Department</h1>
      <DepartmentForm
        user={{ id: user.id, role: user.role as string }}
        departmentOptions={departmentOptions}
        initialData={{
          title: dept.title,
          code: dept.code,
          shortDescription: dept.shortDescription ?? undefined,
          category: dept.category ?? undefined,
          featured: dept.featured ?? false,
          primaryColor: theme?.primaryColor,
          accentColor: theme?.accentColor,
          hodName: hod?.name,
          hodEmail: hod?.email,
          hodDesignation: hod?.designation,
          facultyCount: dept.facultyCount ?? undefined,
          studentCount: dept.studentCount ?? undefined,
          yearEstablished: dept.yearEstablished ?? undefined,
          website: social?.website,
          instagram: social?.instagram,
          linkedin: social?.linkedin,
          editorialDescription: descriptionHtml,
          publishedAt: dept.publishedAt ?? undefined,
          meta: dept.meta
            ? {
                title: (dept.meta as { title?: string }).title ?? undefined,
                description: (dept.meta as { description?: string }).description ?? undefined,
              }
            : undefined,
        }}
        departmentId={id}
        isEdit
      />
    </div>
  )
}
