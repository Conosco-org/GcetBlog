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

// GET handler — list media (proxies to Payload's built-in REST)
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
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Failed to fetch media' },
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
      }) as any

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
  } catch (error: any) {
    console.error('Error uploading media:', error)
    return NextResponse.json(
      { 
        success: false,
        message: error.message || 'Failed to upload image' 
      },
      { status: 500 }
    )
  }
}
