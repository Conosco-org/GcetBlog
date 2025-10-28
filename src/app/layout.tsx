import type { Metadata } from 'next'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { getServerSideURL } from '@/utilities/getURL'

import './(frontend)/globals.css'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return children
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  title: {
    template: '%s | GCET Blog',
    default: 'GCET Blog - Government College of Engineering and Textile Technology',
  },
  description: 'Official blog of Government College of Engineering and Textile Technology, Berhampore. Explore insights, updates, and stories from our academic community.',
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
    creator: '@gcet_official',
  },
}
