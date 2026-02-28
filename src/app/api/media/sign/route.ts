import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import crypto from 'crypto'

/**
 * Returns a Cloudinary signed upload signature so the browser can upload
 * directly to Cloudinary (file never passes through the Vercel function).
 *
 * Usage: GET /api/media/sign?public_id=my-image-name
 */
export async function GET(request: NextRequest) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })

  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const publicId = searchParams.get('public_id')

  const timestamp = Math.round(Date.now() / 1000)
  const folder = 'gcet-blog'

  // Build params to sign — must be sorted alphabetically, must exclude: file, api_key, resource_type
  const signingParams: Record<string, string | number> = { folder, timestamp }
  if (publicId) signingParams.public_id = publicId

  const paramsString = Object.keys(signingParams)
    .sort()
    .map((k) => `${k}=${signingParams[k]}`)
    .join('&')

  const signature = crypto
    .createHash('sha1')
    .update(paramsString + process.env.CLOUDINARY_API_SECRET)
    .digest('hex')

  return NextResponse.json({
    signature,
    timestamp,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    folder,
    publicId: publicId ?? null,
  })
}
