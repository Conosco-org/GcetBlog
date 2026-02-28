import type { CollectionBeforeChangeHook } from 'payload'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

function uploadBuffer(buffer: Buffer, options: Record<string, unknown>): Promise<{ secure_url: string }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error || !result) return reject(error ?? new Error('Cloudinary upload failed'))
      resolve(result as { secure_url: string })
    })
    stream.end(buffer)
  })
}

export const uploadToCloudinary: CollectionBeforeChangeHook = async ({ data, req, operation }) => {
  if (operation !== 'create') return data

  // Get file from the request (Payload stores it here during upload operations)
  const file = (req as any).file as { data?: Buffer; tempFilePath?: string; mimetype?: string } | undefined
  if (!file?.data) return data

  try {
    const buffer = Buffer.isBuffer(file.data) ? file.data : Buffer.from(file.data)

    // Determine resource type from mimetype
    const mimetype = file.mimetype ?? ''
    const resourceType = mimetype.startsWith('video/')
      ? 'video'
      : mimetype.startsWith('image/')
        ? 'image'
        : 'raw'

    // Use the filename (without extension) as public_id for stable URLs
    // data.filename is set by Payload's file processing before beforeChange runs
    const publicId = (data.filename as string | undefined)?.replace(/\.[^/.]+$/, '') ?? String(Date.now())

    const result = await uploadBuffer(buffer, {
      folder: 'gcet-blog',
      public_id: publicId,
      resource_type: resourceType,
      overwrite: true,
    })

    // Return merged data — cloudinaryUrl is saved in the same DB write, no secondary update needed
    return { ...data, cloudinaryUrl: result.secure_url }
  } catch (err) {
    req.payload.logger.error({ err }, 'Cloudinary upload failed')
    return data
  }
}
