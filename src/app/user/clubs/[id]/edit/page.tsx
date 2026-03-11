import { redirect, notFound } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { checkPermission } from '@/access/hasPermission'
import { getDepartmentOptions } from '@/custom/departments'
import { lexicalToHtml } from '@/components/RichTextEditor/lexicalToHtml'
import { ClubForm } from '../../create/ClubForm'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditClubPage({ params }: PageProps) {
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

  let club
  try {
    club = await payload.findByID({
      collection: 'clubs',
      id,
      draft: true,
      depth: 1,
    })
  } catch {
    notFound()
  }

  if (!club) notFound()

  // Convert Lexical content to HTML for the editor
  let descriptionHtml = ''
  if (club.editorialDescription) {
    try {
      descriptionHtml = lexicalToHtml(club.editorialDescription as Parameters<typeof lexicalToHtml>[0])
    } catch {
      descriptionHtml = ''
    }
  }

  const heroImage =
    club.heroImage && typeof club.heroImage === 'object'
      ? { id: String(club.heroImage.id), url: (club.heroImage as { url?: string }).url || undefined }
      : club.heroImage
        ? { id: String(club.heroImage), url: undefined }
        : null

  const logo =
    club.logo && typeof club.logo === 'object'
      ? { id: String(club.logo.id), url: (club.logo as { url?: string }).url || undefined }
      : club.logo
        ? { id: String(club.logo), url: undefined }
        : null

  const socialLinks = club.socialLinks as {
    website?: string
    instagram?: string
    linkedin?: string
    twitter?: string
    github?: string
  } | undefined

  // Resolve meta image
  const metaImage =
    club.meta?.image && typeof club.meta.image === 'object'
      ? { id: String(club.meta.image.id), url: (club.meta.image as { url?: string }).url || undefined }
      : club.meta?.image
        ? { id: String(club.meta.image), url: undefined }
        : null

  // Resolve theme fields
  const theme = club.theme as { primaryColor?: string; accentColor?: string; cardStyle?: string; fontPreset?: string } | undefined

  // Resolve related posts IDs
  const relatedPostIds = ((club.relatedPosts as unknown[]) || []).map((p: unknown) =>
    typeof p === 'object' && p !== null && 'id' in p ? String((p as { id: unknown }).id) : String(p),
  )

  const initialData = {
    title: club.title || '',
    classification: (club.classification as string) || '',
    department: (club.department as string) || '',
    manualStatus: (club.manualStatus as string) || 'active',
    editorialDescription: descriptionHtml,
    heroImage: heroImage?.id,
    heroImageUrl: heroImage?.url,
    logo: logo?.id,
    logoUrl: logo?.url,
    featured: (club.featured as boolean) || false,
    socialLinks: socialLinks || {},
    theme: {
      primaryColor: theme?.primaryColor || '#0047AB',
      accentColor: theme?.accentColor || '',
      cardStyle: theme?.cardStyle || 'default',
      fontPreset: theme?.fontPreset || 'default',
    },
    tags: (club.tags as string[]) || [],
    relatedPosts: relatedPostIds as string[],
    publishedAt: club.publishedAt
      ? new Date(club.publishedAt).toISOString().slice(0, 16)
      : '',
    meta: {
      title: club.meta?.title || '',
      description: club.meta?.description || '',
      image: metaImage?.id,
      imageUrl: metaImage?.url,
    },
  }

  // Fetch department options and posts for selector
  const [departmentOptions, postsResult] = await Promise.all([
    Promise.resolve(getDepartmentOptions()),
    payload.find({
      collection: 'posts',
      limit: 200,
      sort: 'title',
      depth: 0,
    }),
  ])

  const postOptions = postsResult.docs.map((post) => ({
    id: post.id,
    title: typeof post.title === 'string' ? post.title : 'Untitled',
  }))

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Edit Club</h1>
      <ClubForm
        user={{ id: user.id, role: user.role as string }}
        departmentOptions={departmentOptions}
        postOptions={postOptions}
        initialData={initialData}
        clubId={id}
        isEdit={true}
      />
    </div>
  )
}
