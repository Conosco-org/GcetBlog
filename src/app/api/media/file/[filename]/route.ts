import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Media } from '@shared/types/payload-types'

/**
 * Intercepts Payload's /api/media/file/:filename requests.
 * Instead of serving from disk (which doesn't exist when disableLocalStorage is true),
 * we look up the media document and redirect to the Cloudinary CDN URL.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params

  try {
    const payload = await getPayload({ config })

    const result = await payload.find({
      collection: 'media',
      where: { filename: { equals: filename } },
      limit: 1,
      depth: 0,
    })

    const doc = result.docs[0] as Media | undefined

    if (!doc) {
      return NextResponse.json({ message: 'Media not found' }, { status: 404 })
    }

    const redirectUrl = doc.cloudinaryUrl

    if (!redirectUrl) {
      return NextResponse.json(
        { message: 'Media file has no Cloudinary URL' },
        { status: 404 },
      )
    }

    // Permanent redirect to Cloudinary CDN
    return NextResponse.redirect(redirectUrl, { status: 301 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to serve media'
    return NextResponse.json({ message }, { status: 500 })
  }
}
