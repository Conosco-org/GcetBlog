import type { CollectionAfterReadHook } from 'payload'

/**
 * Hook to use Cloudinary URL as fallback when local file is missing
 */
export const useCloudinaryFallback: CollectionAfterReadHook = ({ doc }) => {
  // If cloudinaryUrl exists, use it for all URL fields
  if (doc.cloudinaryUrl) {
    doc.url = doc.cloudinaryUrl
    doc.thumbnailURL = doc.cloudinaryUrl
    
    // Also update sizes to use Cloudinary transformations
    if (doc.sizes) {
      Object.keys(doc.sizes).forEach((sizeName) => {
        if (doc.sizes[sizeName]) {
          doc.sizes[sizeName].url = doc.cloudinaryUrl
        }
      })
    }
  }
  return doc
}
