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
    default: 'GCET Blog',
    template: '%s | GCET Blog',
  },
  description: 'Official blog platform for Geethanjali College of Engineering and Technology',
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
    creator: '@gcet_official',
  },
}
