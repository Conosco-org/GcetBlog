import { redirect } from 'next/navigation'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import type { Metadata } from 'next'

/**
 * /content/[slug] — Content Engine canonical URL
 *
 * This route serves as the canonical URL for all content.
 * It resolves the content variant and either renders or redirects.
 * For now, it redirects to the existing /posts/[slug] route.
 * In a future version, this will become the primary content route.
 */

type Args = {
  params: Promise<{ slug?: string }>
}

export default async function ContentPage({ params: paramsPromise }: Args) {
  const { slug = '' } = await paramsPromise

  const payload = await getPayload({ config: configPromise })

  // Find the post by slug
  const result = await payload.find({
    collection: 'posts',
    where: {
      slug: { equals: slug },
      _status: { equals: 'published' },
    },
    limit: 1,
    depth: 0,
    select: { slug: true, contentVariant: true },
  })

  const post = result.docs[0]

  if (!post) {
    // If not a post, could be an event or club in future
    redirect('/404')
  }

  // For now, redirect to the posts route
  // In v2, this will render the content directly with variant-specific layouts
  redirect(`/posts/${post.slug}`)
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise

  return {
    title: `Content — ${slug}`,
    robots: { index: true, follow: true },
  }
}
