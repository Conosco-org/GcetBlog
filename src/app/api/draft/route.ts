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

  // Verify the user has editor/admin permissions
  let user
  try {
    const result = await payload.auth({ headers: request.headers })
    user = result.user
    
    const hasEditAccess = user && (
      user.role === 'superadmin' ||
      (user as unknown as { roleAssignments?: { assignedRole: string }[] }).roleAssignments?.some(
        (a) => ['blog_editor', 'institution_admin'].includes(a.assignedRole)
      )
    )
    if (!hasEditAccess) {
      return new Response('Forbidden - Editor access required. Please log in as an editor.', { status: 403 })
    }
  } catch (error) {
    console.error('Auth error in draft route:', error)
    return new Response('Unauthorized - Please log in as an editor or admin', { status: 401 })
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

  // Enable Draft Mode
  const draft = await draftMode()
  draft.enable()

  // Redirect to the post
  redirect(`/posts/${slug}`)
}
