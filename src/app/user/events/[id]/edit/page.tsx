import { redirect, notFound } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { checkPermission } from '@/access/hasPermission'
import { getDepartmentOptions } from '@/custom/departments'
import { lexicalToHtml } from '@/components/RichTextEditor/lexicalToHtml'
import { EventForm } from '../../create/EventForm'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditEventPage({ params }: PageProps) {
  const { id } = await params
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()

  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) {
    redirect('/login')
  }

  if (!checkPermission(user, 'event:create')) {
    redirect('/user')
  }

  let event
  try {
    event = await payload.findByID({
      collection: 'events',
      id,
      draft: true,
      depth: 1,
    })
  } catch {
    notFound()
  }

  if (!event) notFound()

  // Convert Lexical content to HTML for the editor
  let descriptionHtml = ''
  if (event.editorialDescription) {
    try {
      descriptionHtml = lexicalToHtml(event.editorialDescription as Parameters<typeof lexicalToHtml>[0])
    } catch {
      descriptionHtml = ''
    }
  }

  const heroImage =
    event.heroImage && typeof event.heroImage === 'object'
      ? { id: String(event.heroImage.id), url: (event.heroImage as { url?: string }).url || undefined }
      : event.heroImage
        ? { id: String(event.heroImage), url: undefined }
        : null

  // Resolve organizing club IDs
  const organizingClubIds = (event.organizingClubs || []).map((c: unknown) =>
    typeof c === 'object' && c !== null && 'id' in c ? String((c as { id: unknown }).id) : String(c),
  )

  // Resolve createdByClub ID
  const createdByClubId =
    event.createdByClub && typeof event.createdByClub === 'object'
      ? String((event.createdByClub as { id: unknown }).id)
      : event.createdByClub
        ? String(event.createdByClub)
        : ''

  // Resolve meta image
  const metaImage =
    event.meta?.image && typeof event.meta.image === 'object'
      ? { id: String(event.meta.image.id), url: (event.meta.image as { url?: string }).url || undefined }
      : event.meta?.image
        ? { id: String(event.meta.image), url: undefined }
        : null

  // Resolve related posts IDs
  const relatedPostIds = ((event.relatedPosts as unknown[]) || []).map((p: unknown) =>
    typeof p === 'object' && p !== null && 'id' in p ? String((p as { id: unknown }).id) : String(p),
  )

  const initialData = {
    title: event.title || '',
    eventType: (event.eventType as string) || '',
    department: (event.department as string) || '',
    dataSource: (event.dataSource as string) || 'manual',
    manualStatus: (event.manualStatus as string) || 'upcoming',
    startDate: event.startDate
      ? new Date(event.startDate).toISOString().slice(0, 16)
      : '',
    endDate: event.endDate
      ? new Date(event.endDate).toISOString().slice(0, 16)
      : '',
    venue: (event.venue as string) || '',
    editorialDescription: descriptionHtml,
    heroImage: heroImage?.id,
    heroImageUrl: heroImage?.url,
    featured: (event.featured as boolean) || false,
    organizingClubs: organizingClubIds as string[],
    createdByClub: createdByClubId,
    registrationUrl: (event.registrationUrl as string) || '',
    externalPlatform: (event.externalPlatform as string) || '',
    externalEventUrl: (event.externalEventUrl as string) || '',
    tags: (event.tags as string[]) || [],
    relatedPosts: relatedPostIds as string[],
    publishedAt: event.publishedAt
      ? new Date(event.publishedAt).toISOString().slice(0, 16)
      : '',
    meta: {
      title: event.meta?.title || '',
      description: event.meta?.description || '',
      image: metaImage?.id,
      imageUrl: metaImage?.url,
    },
  }

  // Fetch clubs and posts for selectors
  const [departmentOptions, clubsResult, postsResult] = await Promise.all([
    Promise.resolve(getDepartmentOptions()),
    payload.find({
      collection: 'clubs',
      limit: 200,
      sort: 'title',
      depth: 0,
    }),
    payload.find({
      collection: 'posts',
      limit: 200,
      sort: 'title',
      depth: 0,
    }),
  ])

  const clubOptions = clubsResult.docs.map((club) => ({
    id: club.id,
    title: club.title,
  }))

  const postOptions = postsResult.docs.map((post) => ({
    id: post.id,
    title: typeof post.title === 'string' ? post.title : 'Untitled',
  }))

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Edit Event</h1>
      <EventForm
        user={{ id: user.id, role: user.role as string }}
        departmentOptions={departmentOptions}
        clubOptions={clubOptions}
        postOptions={postOptions}
        initialData={initialData}
        eventId={id}
        isEdit={true}
      />
    </div>
  )
}
