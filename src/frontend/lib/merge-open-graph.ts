import type { Metadata } from 'next'
import { getServerSideURL } from '../../shared/lib/get-url'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description: 'Official blog of Geethanjali College of Engineering and Technology.',
  images: [
    {
      url: `${getServerSideURL()}/gcet-logo.png`,
    },
  ],
  siteName: 'GCET Blog',
  title: 'GCET Blog',
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}
