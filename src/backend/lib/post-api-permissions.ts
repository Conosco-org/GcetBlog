type PostActor = {
  id: string | number
  role?: string | null
  isAdmin?: boolean | null
}

type PostRecord = {
  authors?: unknown[] | null
  _status?: string | null
  reviewStatus?: string | null
  archiveStatus?: string | null
}

export function isPostEditor(actor: PostActor): boolean {
  return actor.isAdmin === true || actor.role === 'admin' || actor.role === 'editor'
}

export function canCreatePost(actor: PostActor): boolean {
  return isPostEditor(actor) || actor.role === 'contributor'
}

export function getPostAuthorIds(post: PostRecord): string[] {
  return (post.authors || []).map((author) =>
    typeof author === 'object' && author !== null && 'id' in author
      ? String((author as { id: unknown }).id)
      : String(author),
  )
}

export function canUpdatePost(actor: PostActor, post: PostRecord): boolean {
  if (isPostEditor(actor)) return true
  if (actor.role !== 'contributor' || post._status === 'published') return false
  return getPostAuthorIds(post).includes(String(actor.id))
}

export function canContributorEditStatus(reviewStatus?: string | null): boolean {
  return reviewStatus === 'draft' || reviewStatus === 'requesting_changes'
}

export function isContributorReviewStatusAllowed(reviewStatus: unknown): boolean {
  return reviewStatus === undefined || reviewStatus === 'draft' || reviewStatus === 'pending_review'
}

export function isActivePendingReview(post: PostRecord): boolean {
  return (
    post._status === 'draft' &&
    post.reviewStatus === 'pending_review' &&
    post.archiveStatus !== 'archived' &&
    post.archiveStatus !== 'deleted'
  )
}
