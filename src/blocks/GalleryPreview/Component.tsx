import React from 'react'
import { ImageIcon } from 'lucide-react'

interface GalleryImage {
  image?: string | { url?: string; alt?: string } | null
  caption?: string | null
}

interface GalleryPreviewBlockProps {
  heading?: string | null
  images?: GalleryImage[] | null
  layout?: 'grid' | 'masonry' | null
  limit?: number | null
}

export const GalleryPreviewBlockComponent: React.FC<GalleryPreviewBlockProps> = ({
  heading = 'Gallery',
  images,
  layout = 'grid',
  limit = 6,
}) => {
  if (!images || images.length === 0) {
    return (
      <div className="container">
        {heading && <h2 className="text-2xl font-display font-bold mb-4">{heading}</h2>}
        <p className="text-muted-foreground text-sm">No images added yet.</p>
      </div>
    )
  }

  const displayImages = images.slice(0, limit || 6)

  const getImageData = (img: GalleryImage['image']): { url: string; alt: string } | null => {
    if (!img) return null
    if (typeof img === 'string') return { url: img, alt: '' }
    if (img.url) return { url: img.url, alt: img.alt || '' }
    return null
  }

  if (layout === 'masonry') {
    return (
      <div className="container">
        {heading && <h2 className="text-2xl font-display font-bold mb-6">{heading}</h2>}
        <div className="columns-2 md:columns-3 gap-4 space-y-4">
          {displayImages.map((item, i) => {
            const imgData = getImageData(item.image)
            if (!imgData) return null
            return (
              <div key={i} className="break-inside-avoid group relative overflow-hidden rounded-xl border border-border">
                <img
                  src={imgData.url}
                  alt={item.caption || imgData.alt}
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
                {item.caption && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs">{item.caption}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
        {images.length > (limit || 6) && (
          <p className="text-center text-sm text-muted-foreground mt-4">
            +{images.length - (limit || 6)} more photos
          </p>
        )}
      </div>
    )
  }

  // Grid layout (default)
  return (
    <div className="container">
      {heading && <h2 className="text-2xl font-display font-bold mb-6">{heading}</h2>}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {displayImages.map((item, i) => {
          const imgData = getImageData(item.image)
          if (!imgData) return null
          return (
            <div
              key={i}
              className="group relative aspect-square overflow-hidden rounded-xl border border-border"
            >
              <img
                src={imgData.url}
                alt={item.caption || imgData.alt}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                loading="lazy"
              />
              {item.caption && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-xs">{item.caption}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
      {images.length > (limit || 6) && (
        <p className="text-center text-sm text-muted-foreground mt-4">
          +{images.length - (limit || 6)} more photos
        </p>
      )}
    </div>
  )
}
