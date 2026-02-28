/**
 * Uploads a file directly from the browser to Cloudinary,
 * then registers a media document in Payload via a tiny JSON request.
 *
 * This completely bypasses Vercel's 4.5 MB serverless payload limit —
 * files go  browser → Cloudinary  and only the resulting URL travels
 * through the Next.js API route.
 */
export interface UploadMediaResult {
  id: string
  cloudinaryUrl: string
  url: string
}

export async function uploadToCloudinaryDirect(
  file: File,
  alt?: string,
): Promise<UploadMediaResult> {
  // ── 1. Derive a clean public_id from the filename ──────────────────────────
  const publicId = file.name
    .replace(/\.[^/.]+$/, '')          // strip extension
    .replace(/[^a-zA-Z0-9_-]/g, '_')  // sanitise

  // ── 2. Get a signed upload signature from our server ──────────────────────
  const signRes = await fetch(`/api/media/sign?public_id=${encodeURIComponent(publicId)}`)
  if (!signRes.ok) throw new Error('Failed to get upload credentials')

  const { signature, timestamp, apiKey, cloudName, folder } = (await signRes.json()) as {
    signature: string
    timestamp: number
    apiKey: string
    cloudName: string
    folder: string
  }

  // ── 3. Upload directly to Cloudinary (browser → Cloudinary) ───────────────
  const resourceType = file.type.startsWith('video/') ? 'video' : 'image'

  const cloudinaryForm = new FormData()
  cloudinaryForm.append('file', file)
  cloudinaryForm.append('api_key', apiKey)
  cloudinaryForm.append('timestamp', String(timestamp))
  cloudinaryForm.append('signature', signature)
  cloudinaryForm.append('folder', folder)
  cloudinaryForm.append('public_id', publicId)

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
    { method: 'POST', body: cloudinaryForm },
  )

  if (!uploadRes.ok) {
    const err = (await uploadRes.json()) as { error?: { message?: string } }
    throw new Error(err.error?.message ?? 'Cloudinary upload failed')
  }

  const uploaded = (await uploadRes.json()) as {
    secure_url: string
    public_id: string
    bytes: number
    width?: number
    height?: number
    format?: string
    resource_type?: string
  }

  // ── 4. Register the media document in Payload (JSON only, no file body) ───
  const mediaRes = await fetch('/api/media', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      cloudinaryUrl: uploaded.secure_url,
      alt: alt ?? file.name,
      filename: uploaded.public_id,
      mimeType: file.type || `${uploaded.resource_type ?? 'image'}/${uploaded.format ?? 'jpeg'}`,
      filesize: uploaded.bytes,
      width: uploaded.width ?? 0,
      height: uploaded.height ?? 0,
    }),
  })

  if (!mediaRes.ok) {
    const err = (await mediaRes.json()) as { message?: string }
    throw new Error(err.message ?? 'Failed to save media record')
  }

  const media = (await mediaRes.json()) as { doc: { id: string } }

  return {
    id: media.doc.id,
    cloudinaryUrl: uploaded.secure_url,
    url: uploaded.secure_url,
  }
}
