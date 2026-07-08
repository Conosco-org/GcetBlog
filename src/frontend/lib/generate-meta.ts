import type { Metadata } from 'next'

import type { Media, Page, Post, Config } from '../../shared/types/payload-types'

import { mergeOpenGraph } from './merge-open-graph'
import { getServerSideURL } from '../../shared/lib/get-url'

const getImageURL = (image?: Media | Config['db']['defaultIDType'] | null) => {
  const serverUrl = getServerSideURL()

  let url = serverUrl + '/gcet-logo.png'

  if (image && typeof image === 'object' && 'url' in image) {
    const ogUrl = image.sizes?.og?.url

    url = ogUrl ? serverUrl + ogUrl : serverUrl + image.url
  }

  return url
}

export const generateMeta = async (args: {
  doc: Partial<Page> | Partial<Post> | null
  pathname?: string
}): Promise<Metadata> => {
  const { doc, pathname } = args

  const ogImage = getImageURL(doc?.meta?.image)
  const pagePath = pathname || (doc?.slug ? `/${doc.slug}` : '/')

  const rawTitle = doc?.title
  // Sanitize the default Payload seed title
  const sanitizedTitle =
    !rawTitle || rawTitle === 'Payload Website Template' ? 'GCET Blog' : rawTitle
  const title = sanitizedTitle

  return {
    description: doc?.meta?.description,
    alternates: {
      canonical: pagePath,
    },
    openGraph: mergeOpenGraph({
      description: doc?.meta?.description || '',
      images: ogImage
        ? [
            {
              url: ogImage,
            },
          ]
        : undefined,
      title,
      url: pagePath,
    }),
    title,
  }
}
