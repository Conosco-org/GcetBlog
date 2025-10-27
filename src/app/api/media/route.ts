import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

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

    if (!file) {
      return NextResponse.json(
        { message: 'No file provided' },
        { status: 400 }
      )
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

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

    // Create media document with Cloudinary URL directly
    // Don't use the 'file' parameter to avoid Payload's local file handling
    const media = await payload.create({
      collection: 'media',
      data: {
        alt: file.name,
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
