import type { CollectionAfterChangeHook } from 'payload'
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

export const uploadToCloudinary: CollectionAfterChangeHook = async ({ doc, req, operation }) => {
  if (operation !== 'create') return doc

  // Get file from the request (Payload stores it here during upload operations)
  const file = (req as any).file as { data?: Buffer; tempFilePath?: string; mimetype?: string } | undefined
  if (!file?.data) return doc

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
    const publicId = (doc.filename as string | undefined)?.replace(/\.[^/.]+$/, '') ?? doc.id

    const result = await uploadBuffer(buffer, {
      folder: 'gcet-blog',
      public_id: publicId,
      resource_type: resourceType,
      overwrite: true,
    })

    // Write cloudinaryUrl back to the document
    await req.payload.update({
      collection: 'media',
      id: doc.id,
      data: { cloudinaryUrl: result.secure_url },
      overrideAccess: true,
    })

    return { ...doc, cloudinaryUrl: result.secure_url }
  } catch (err) {
    req.payload.logger.error({ err }, 'Cloudinary upload failed')
    return doc
  }
}
