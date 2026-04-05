import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')

  // Verify the post exists
  if (!slug) {
    return new Response('Slug is required', { status: 400 })
  }

  const payload = await getPayload({ config: configPromise })

  // Verify the user has editor/admin/contributor permissions
  let user
  try {
    const result = await payload.auth({ headers: request.headers })
    user = result.user
    
    if (!user || !['editor', 'admin', 'contributor'].includes(user.role || '')) {
      return new Response('Forbidden - You must be logged in to preview drafts.', { status: 403 })
    }
  } catch (error) {
    console.error('Auth error in draft route:', error)
    return new Response('Unauthorized - Please log in', { status: 401 })
  }

  // Fetch the post to verify it exists
  const result = await payload.find({
    collection: 'posts',
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
    draft: true, // Include drafts
    overrideAccess: true,
  })

  if (!result.docs || result.docs.length === 0) {
    return new Response(`Post with slug "${slug}" not found in database`, { status: 404 })
  }

  const post = result.docs[0]

  // Contributors can only preview their own unpublished posts
  if (user.role === 'contributor') {
    const authorIds = (post.authors || []).map((a: unknown) =>
      typeof a === 'object' && a !== null && 'id' in a ? String((a as { id: unknown }).id) : String(a)
    )
    
    const isAuthor = authorIds.includes(String(user.id))
    const isPublished = post._status === 'published'

    if (!isAuthor) {
      return new Response('Forbidden - You can only preview your own posts', { status: 403 })
    }

    if (isPublished) {
      return new Response('Forbidden - You can only preview unpublished posts', { status: 403 })
    }
  }

  // Enable Draft Mode
  const draft = await draftMode()
  draft.enable()

  // Redirect to the post
  redirect(`/posts/${slug}`)
}
