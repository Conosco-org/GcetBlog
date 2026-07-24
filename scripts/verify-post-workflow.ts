import {
  canContributorEditStatus,
  canCreatePost,
  canUpdatePost,
  isContributorReviewStatusAllowed,
  isActivePendingReview,
  isPostEditor,
} from '../src/backend/lib/post-api-permissions'

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

const contributor = { id: 'contributor-1', role: 'contributor' }
const otherContributor = { id: 'contributor-2', role: 'contributor' }
const editor = { id: 'editor-1', role: 'editor' }
const flaggedAdmin = { id: 'admin-1', role: 'editor', isAdmin: true }
const reader = { id: 'reader-1', role: 'user' }

const ownDraft = {
  authors: ['contributor-1'],
  _status: 'draft',
  reviewStatus: 'draft',
}
const otherDraft = {
  authors: [{ id: 'contributor-2' }],
  _status: 'draft',
  reviewStatus: 'draft',
}
const ownPublished = {
  authors: ['contributor-1'],
  _status: 'published',
  reviewStatus: 'approved',
}

assert(canCreatePost(contributor), 'contributors should be able to create posts')
assert(canCreatePost(editor), 'editors should be able to create posts')
assert(!canCreatePost(reader), 'regular users must not be able to create posts')
assert(isPostEditor(flaggedAdmin), 'isAdmin users should receive editor permissions')

assert(canUpdatePost(contributor, ownDraft), 'contributors should update their own drafts')
assert(!canUpdatePost(contributor, otherDraft), 'contributors must not update another author’s draft')
assert(!canUpdatePost(otherContributor, ownDraft), 'ownership checks must use the authenticated actor')
assert(!canUpdatePost(contributor, ownPublished), 'contributors must not update published posts')
assert(canUpdatePost(editor, ownPublished), 'editors should update published posts')

assert(canContributorEditStatus('draft'), 'draft posts should be editable')
assert(canContributorEditStatus('requesting_changes'), 'posts requesting changes should be editable')
assert(!canContributorEditStatus('pending_review'), 'pending posts should not be editable')
assert(isContributorReviewStatusAllowed('pending_review'), 'contributors should submit for review')
assert(!isContributorReviewStatusAllowed('approved'), 'contributors must not approve posts')
assert(
  isActivePendingReview({ ...ownDraft, reviewStatus: 'pending_review', archiveStatus: 'active' }),
  'active pending drafts should be reviewable',
)
assert(
  !isActivePendingReview({ ...ownDraft, reviewStatus: 'pending_review', archiveStatus: 'archived' }),
  'archived posts must not be reviewable',
)
assert(!isActivePendingReview(ownPublished), 'published posts must not re-enter review actions')

console.log('Post workflow verification passed')
