import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary (only if env vars are present)
const cloudinaryConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
)

if (cloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
}

// GET handler - list media (proxies to Payload's built-in REST)
export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')
    const sort = searchParams.get('sort') || '-createdAt'

    const result = await payload.find({
      collection: 'media',
      limit,
      page,
      sort,
    })

    return NextResponse.json(result)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch media'
    return NextResponse.json(
      { message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })

    // Verify user is authenticated
    const { user } = await payload.auth({ headers: request.headers })
    
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // ── JSON mode: file already uploaded to Cloudinary by the browser ────────
    // The browser POSTs { cloudinaryUrl, alt, filename, mimeType, filesize, width, height }
    // so no file body passes through this serverless function (avoids Vercel 4.5 MB limit).
    const contentType = request.headers.get('content-type') ?? ''
    if (contentType.includes('application/json')) {
      const body = (await request.json()) as {
        cloudinaryUrl?: string
        alt?: string
        filename?: string
        mimeType?: string
        filesize?: number
        width?: number
        height?: number
      }

      if (!body.cloudinaryUrl) {
        return NextResponse.json({ message: 'cloudinaryUrl is required' }, { status: 400 })
      }

      // Payload requires a file for upload collections even with disableLocalStorage.
      // Pass a 1×1 transparent PNG placeholder - our beforeChange hook skips
      // re-uploading because cloudinaryUrl is already set in data.
      const PLACEHOLDER_PNG = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64',
      )
      const filename = (body.filename ?? body.cloudinaryUrl.split('/').pop() ?? 'image')
        .replace(/\.[^/.]+$/, '') + '.png'

      const media = await payload.create({
        collection: 'media',
        data: {
          alt: body.alt ?? 'Uploaded image',
          cloudinaryUrl: body.cloudinaryUrl,
          mimeType: body.mimeType ?? 'image/jpeg',
          filesize: body.filesize ?? 0,
          width: body.width ?? 0,
          height: body.height ?? 0,
        },
        file: {
          data: PLACEHOLDER_PNG,
          mimetype: 'image/png',
          name: filename,
          size: PLACEHOLDER_PNG.length,
        },
        overrideAccess: false,
        user,
      })

      return NextResponse.json({
        success: true,
        doc: media,
        cloudinaryUrl: body.cloudinaryUrl,
        message: 'Media record created',
      })
    }
    // ── FormData mode (legacy / local dev without Vercel limits) ─────────────

    const formData = await request.formData()
    const file = formData.get('file') as File
    const alt = (formData.get('alt') as string) || file?.name || 'Uploaded image'

    if (!file) {
      return NextResponse.json(
        { message: 'No file provided' },
        { status: 400 }
      )
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    if (cloudinaryConfigured) {
      // Upload to Cloudinary
      const uploadResponse = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: 'gcet-blog',
            resource_type: 'auto',
          },
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          }
        ).end(buffer)
      }) as unknown as { secure_url: string; public_id: string; bytes: number; width: number; height: number }

      // Create media document with Cloudinary URL
      const media = await payload.create({
        collection: 'media',
        data: {
          alt,
          cloudinaryUrl: uploadResponse.secure_url,
          url: uploadResponse.secure_url,
          filename: uploadResponse.public_id,
          mimeType: file.type,
          filesize: uploadResponse.bytes,
          width: uploadResponse.width,
          height: uploadResponse.height,
        },
      })

      return NextResponse.json({
        success: true,
        doc: media,
        cloudinaryUrl: uploadResponse.secure_url,
        message: 'Image uploaded successfully to Cloudinary',
      })
    } else {
      // Fallback: use Payload's built-in local file upload
      const media = await payload.create({
        collection: 'media',
        data: {
          alt,
        },
        file: {
          data: buffer,
          mimetype: file.type,
          name: file.name,
          size: file.size,
        },
      })

      return NextResponse.json({
        success: true,
        doc: media,
        cloudinaryUrl: null,
        message: 'Image uploaded successfully (local storage)',
      })
    }
  } catch (error: unknown) {
    console.error('Error uploading media:', error)
    const message = error instanceof Error ? error.message : 'Failed to upload image'
    return NextResponse.json(
      { 
        success: false,
        message 
      },
      { status: 500 }
    )
  }
}
