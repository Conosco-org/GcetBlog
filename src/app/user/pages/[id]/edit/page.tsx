import { redirect, notFound } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { checkPermission } from '@/access/hasPermission'
import { lexicalToHtml } from '@/components/RichTextEditor/lexicalToHtml'
import { PageForm } from '../../create/PageForm'
import type { BlockData } from '../../create/PageForm'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditPagePage({ params }: PageProps) {
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

  let page
  try {
    page = await payload.findByID({
      collection: 'pages',
      id,
      draft: true,
      depth: 2,
    })
  } catch {
    notFound()
  }

  if (!page) notFound()

  // ---- Convert hero data ----
  const hero = page.hero as {
    type?: string
    richText?: unknown
    media?: unknown
  } | undefined

  let heroRichTextHtml = ''
  if (hero?.richText) {
    try {
      heroRichTextHtml = lexicalToHtml(hero.richText as Parameters<typeof lexicalToHtml>[0])
    } catch {
      heroRichTextHtml = ''
    }
  }

  const heroMedia = hero?.media && typeof hero.media === 'object'
    ? { id: String((hero.media as { id: unknown }).id), url: (hero.media as { url?: string }).url }
    : hero?.media
      ? { id: String(hero.media), url: undefined }
      : null

  // ---- Resolve club ----
  const clubField = page.club
  const clubId = clubField && typeof clubField === 'object'
    ? String((clubField as { id: unknown }).id)
    : clubField
      ? String(clubField)
      : ''

  // ---- Resolve meta image ----
  const metaImage = page.meta?.image && typeof page.meta.image === 'object'
    ? { id: String((page.meta.image as { id: unknown }).id), url: (page.meta.image as { url?: string }).url }
    : page.meta?.image
      ? { id: String(page.meta.image), url: undefined }
      : null

  // ---- Convert layout blocks ----
  const rawBlocks = Array.isArray(page.layout) ? (page.layout as unknown as Record<string, unknown>[]) : []
  let blockIdCounter = 0
  const blocks: BlockData[] = rawBlocks.map((block: Record<string, unknown>) => {
    blockIdCounter++
    const blockId = `edit_${blockIdCounter}_${Date.now()}`

    // For content blocks, convert richText columns to _html
    if (block.blockType === 'content' && Array.isArray(block.columns)) {
      const columns = (block.columns as Array<Record<string, unknown>>).map((col) => {
        let html = ''
        if (col.richText) {
          try {
            html = lexicalToHtml(col.richText as Parameters<typeof lexicalToHtml>[0])
          } catch {
            html = ''
          }
        }
        return {
          size: (col.size as string) || 'full',
          _html: html,
        }
      })
      return { ...block, id: blockId, columns } as unknown as BlockData
    }

    // For CTA blocks, convert richText to _richTextHtml
    if (block.blockType === 'cta' && block.richText) {
      let html = ''
      try {
        html = lexicalToHtml(block.richText as Parameters<typeof lexicalToHtml>[0])
      } catch {
        html = ''
      }
      return { ...block, id: blockId, _richTextHtml: html } as unknown as BlockData
    }

    // For gallery blocks, add _tempUrl from resolved images
    if (block.blockType === 'galleryPreview' && Array.isArray(block.images)) {
      const images = (block.images as Array<Record<string, unknown>>).map((img) => {
        const mediaObj = img.image && typeof img.image === 'object'
          ? img.image as { id: unknown; url?: string }
          : null
        return {
          image: mediaObj ? String(mediaObj.id) : img.image ? String(img.image) : undefined,
          caption: (img.caption as string) || '',
          _tempUrl: mediaObj?.url || undefined,
        }
      })
      return { ...block, id: blockId, images } as unknown as BlockData
    }

    // For media blocks, resolve the media URL
    if (block.blockType === 'mediaBlock' && block.media) {
      const mediaObj = typeof block.media === 'object'
        ? block.media as { id: unknown; url?: string }
        : null
      return {
        ...block,
        id: blockId,
        media: mediaObj ? String(mediaObj.id) : String(block.media),
        _mediaUrl: mediaObj?.url || undefined,
      } as unknown as BlockData
    }

    // For sponsors with logos, resolve logo URLs
    if (block.blockType === 'sponsors' && Array.isArray(block.sponsors)) {
      const sponsors = (block.sponsors as Array<Record<string, unknown>>).map((s) => {
        const logoObj = s.logo && typeof s.logo === 'object'
          ? s.logo as { id: unknown; url?: string }
          : null
        return {
          name: (s.name as string) || '',
          url: (s.url as string) || '',
          tier: (s.tier as string) || 'partner',
          logo: logoObj ? String(logoObj.id) : s.logo ? String(s.logo) : undefined,
          _logoUrl: logoObj?.url || undefined,
        }
      })
      return { ...block, id: blockId, sponsors } as unknown as BlockData
    }

    return { ...block, id: blockId } as unknown as BlockData
  })

  // ---- Build initialData ----
  const initialData = {
    title: (page.title as string) || '',
    slug: (page.slug as string) || '',
    heroType: hero?.type || 'none',
    heroMediaId: heroMedia?.id,
    heroMediaUrl: heroMedia?.url,
    heroRichText: heroRichTextHtml,
    club: clubId,
    publishedAt: page.publishedAt
      ? new Date(page.publishedAt).toISOString().slice(0, 16)
      : '',
    blocks,
    meta: {
      title: page.meta?.title || '',
      description: page.meta?.description || '',
      image: metaImage?.id,
      imageUrl: metaImage?.url,
    },
  }

  // ---- Fetch clubs for selector ----
  const clubsResult = await payload.find({
    collection: 'clubs',
    limit: 500,
    sort: 'title',
    depth: 0,
    select: { title: true, slug: true },
  })

  const clubOptions = clubsResult.docs.map((club) => ({
    id: club.id,
    title: typeof club.title === 'string' ? club.title : 'Untitled',
    slug: (club.slug as string) || '',
  }))

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Edit Page</h1>
      <PageForm
        user={{ id: user.id, role: user.role as string }}
        clubOptions={clubOptions}
        initialData={initialData}
        pageId={id}
        isEdit={true}
      />
    </div>
  )
}
