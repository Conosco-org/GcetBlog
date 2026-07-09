import type { Payload } from 'payload'

import { parseBulkBody, runBulk } from '../src/app/api/archive/bulk-utils'
import { validateArchiveConfigBody } from '../src/backend/archive/config-validation'
import { daysAgoCutoff, isArchivedItemRestorable, normalizeRetentionDays } from '../src/backend/archive/helpers'
import {
  archiveComment,
  archivePost,
  deleteArchivedComment,
  findEligibleCommentsForArchive,
  findEligiblePostsForArchive,
  findExpiredArchivedComments,
  findExpiredArchivedPosts,
  normalizeArchiveConfig,
  restoreArchivedComment,
  runArchiveMaintenance,
} from '../src/backend/archive/service'

type RecordDoc = Record<string, unknown> & { id: string }

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

function matchesWhere(doc: Record<string, unknown>, where: Record<string, unknown>): boolean {
  if (Array.isArray(where.and)) return where.and.every((item) => matchesWhere(doc, item))
  if (Array.isArray(where.or)) return where.or.some((item) => matchesWhere(doc, item))
  return Object.entries(where).every(([field, condition]) => {
    const value = doc[field]
    if (!condition || typeof condition !== 'object') return value === condition
    const operator = condition as Record<string, unknown>
    if ('equals' in operator) return Array.isArray(value) ? value.includes(operator.equals) : value === operator.equals
    if ('exists' in operator) return operator.exists ? value !== undefined : value === undefined
    if ('less_than_equal' in operator) return value !== undefined && String(value) <= String(operator.less_than_equal)
    return false
  })
}

class FakePayload {
  posts: RecordDoc[]
  comments: RecordDoc[]
  archivedPosts: RecordDoc[] = []
  archivedComments: RecordDoc[] = []
  users = new Map([['contributor-1', { id: 'contributor-1', role: 'contributor' }]])
  global = {
    postQueueRetentionDays: 90,
    postArchiveRetentionDays: 30,
    commentQueueRetentionDays: 30,
    commentArchiveRetentionDays: 15,
    autoArchivePostsEnabled: true,
    autoArchiveCommentsEnabled: true,
    jobSchedule: 'daily',
    dryRunEnabled: false,
    lastRunAt: null as string | null,
  }
  failCommentUpdateId?: string

  constructor(now: Date) {
    this.posts = [
      {
        id: 'old-pending-post',
        title: 'Old pending',
        authors: ['contributor-1'],
        _status: 'draft',
        reviewStatus: 'pending_review',
        archiveStatus: 'active',
        reviewQueueAgeStartedAt: daysAgoCutoff(100, now),
      },
      {
        id: 'published-post',
        title: 'Published',
        authors: ['contributor-1'],
        _status: 'published',
        reviewStatus: 'approved',
        archiveStatus: 'active',
        reviewQueueAgeStartedAt: daysAgoCutoff(100, now),
      },
      {
        id: 'legacy-pending-post',
        title: 'Legacy pending',
        authors: ['contributor-1'],
        _status: 'draft',
        reviewStatus: 'pending_review',
        archiveStatus: 'active',
      },
    ]
    this.comments = [
      {
        id: 'old-pending-comment',
        content: 'Pending comment',
        status: 'pending',
        post: 'old-pending-post',
        author: 'contributor-1',
        reviewQueueAgeStartedAt: daysAgoCutoff(40, now),
      },
      {
        id: 'approved-comment',
        content: 'Live comment',
        status: 'approved',
        post: 'published-post',
        reviewQueueAgeStartedAt: daysAgoCutoff(40, now),
      },
      {
        id: 'legacy-pending-comment',
        content: 'Legacy pending comment',
        status: 'pending',
        post: 'old-pending-post',
      },
    ]
  }

  async findGlobal() {
    return this.global
  }

  async updateGlobal(input: { data: Record<string, unknown> }) {
    Object.assign(this.global, input.data)
    return this.global
  }

  source(collection: string): RecordDoc[] {
    if (collection === 'posts') return this.posts
    if (collection === 'comments') return this.comments
    if (collection === 'archived-posts') return this.archivedPosts
    if (collection === 'archived-comments') return this.archivedComments
    return []
  }

  async find(input: { collection: string; where?: Record<string, unknown>; limit?: number }) {
    const docs = input.where
      ? this.source(input.collection).filter((doc) => matchesWhere(doc, input.where!))
      : this.source(input.collection)
    const limited = input.limit ? docs.slice(0, input.limit) : docs
    return { docs: limited, totalDocs: limited.length }
  }

  async findByID(input: { collection: string; id: string }) {
    if (input.collection === 'users') return this.users.get(input.id) || null
    const doc = this.source(input.collection).find((item) => item.id === input.id)
    if (!doc) return null
    if (input.collection === 'archived-posts') {
      return { ...doc, post: this.posts.find((post) => post.id === doc.post) || doc.post }
    }
    if (input.collection === 'archived-comments') {
      return { ...doc, comment: this.comments.find((comment) => comment.id === doc.comment) || doc.comment }
    }
    return doc
  }

  async create(input: { collection: string; data: Record<string, unknown> }) {
    const target = this.source(input.collection)
    const prefix = input.collection === 'archived-posts' ? 'post-archive' : 'comment-archive'
    const doc = { id: `${prefix}-${target.length + 1}`, ...input.data }
    target.push(doc)
    return doc
  }

  async update(input: { collection: string; id: string; data: Record<string, unknown> }) {
    if (input.collection === 'comments' && input.id === this.failCommentUpdateId) {
      throw new Error('comment update failed')
    }
    const doc = this.source(input.collection).find((item) => item.id === input.id)
    if (!doc) throw new Error('Not found')
    Object.assign(doc, input.data)
    return doc
  }

  async delete(input: { collection: string; id: string }) {
    const source = this.source(input.collection)
    const index = source.findIndex((item) => item.id === input.id)
    if (index < 0) throw new Error('Not found')
    source.splice(index, 1)
    return { id: input.id }
  }
}

async function main() {
  const now = new Date('2026-07-09T00:00:00.000Z')

  const defaults = normalizeArchiveConfig()
  assert(defaults.postQueueRetentionDays === 90, 'post queue default mismatch')
  assert(defaults.commentArchiveRetentionDays === 15, 'comment archive default mismatch')
  assert(normalizeRetentionDays(0, 30) === 30, 'invalid retention should use fallback')
  assert('error' in validateArchiveConfigBody({}), 'empty config must fail validation')
  assert(
    !('error' in validateArchiveConfigBody({ ...defaults, jobSchedule: 'daily' })),
    'default config should validate',
  )
  assert(!isArchivedItemRestorable(daysAgoCutoff(15, now), 15, now), 'archive should expire at boundary')

  const eligibilityFake = new FakePayload(now)
  const eligibilityPayload = eligibilityFake as unknown as Payload
  const eligiblePosts = await findEligiblePostsForArchive(eligibilityPayload, eligibilityFake.global, now)
  const eligibleComments = await findEligibleCommentsForArchive(eligibilityPayload, eligibilityFake.global, now)
  assert(eligiblePosts.docs.length === 1 && eligiblePosts.docs[0].id === 'old-pending-post', 'post eligibility mismatch')
  assert(
    eligibleComments.docs.length === 1 && eligibleComments.docs[0].id === 'old-pending-comment',
    'comment eligibility mismatch',
  )

  await archiveComment({ payload: eligibilityPayload, commentId: 'old-pending-comment', user: { id: 'editor-1' } })
  assert(String(eligibilityFake.comments[0].status) === 'archived', 'comment source should be marked archived')
  assert(eligibilityFake.archivedComments.length === 1, 'comment archive record should be created')
  await restoreArchivedComment({ payload: eligibilityPayload, archiveId: 'comment-archive-1' })
  assert(String(eligibilityFake.comments[0].status) === 'pending', 'comment restore should return to pending')
  assert(Boolean(eligibilityFake.comments[0].reviewQueueAgeStartedAt), 'comment restore should reset queue age')

  await archiveComment({ payload: eligibilityPayload, commentId: 'old-pending-comment' })
  await deleteArchivedComment({ payload: eligibilityPayload, archiveId: 'comment-archive-1' })
  assert(!eligibilityFake.comments.some((comment) => comment.id === 'old-pending-comment'), 'comment should hard-delete')
  assert(Number(eligibilityFake.archivedComments.length) === 0, 'comment archive should hard-delete')

  const expiryFake = new FakePayload(now)
  expiryFake.archivedPosts.push({ id: 'expired-post', archivedAt: daysAgoCutoff(31, now), post: 'old-pending-post' })
  expiryFake.archivedComments.push({
    id: 'expired-comment',
    archivedAt: daysAgoCutoff(16, now),
    comment: 'old-pending-comment',
  })
  assert((await findExpiredArchivedPosts(expiryFake as unknown as Payload, 30, now)).docs.length === 1, 'post expiry mismatch')
  assert(
    (await findExpiredArchivedComments(expiryFake as unknown as Payload, 15, now)).docs.length === 1,
    'comment expiry mismatch',
  )

  const parsed = parseBulkBody({ type: 'posts', ids: ['one', 'one', 'two'] }, 'ids')
  assert(!('error' in parsed) && parsed.ids.length === 2, 'bulk IDs should be deduplicated')
  assert(
    'error' in parseBulkBody({ type: 'posts', ids: Array.from({ length: 101 }, (_, i) => String(i)) }, 'ids'),
    'bulk limit should reject more than 100 IDs',
  )
  const mixed = await runBulk(['ok', 'bad'], async (id) => {
    if (id === 'bad') throw new Error('expected failure')
  })
  assert(mixed.succeeded.length === 1 && mixed.failed.length === 1, 'bulk operations should continue after failure')

  const resilientFake = new FakePayload(now)
  resilientFake.failCommentUpdateId = 'old-pending-comment'
  const resilientResult = await runArchiveMaintenance(resilientFake as unknown as Payload, { force: true, now })
  assert(resilientResult.errors.length === 1, 'maintenance should report item failure')
  assert(resilientResult.postsArchived === 1, 'post processing should continue after comment failure')

  const togglesFake = new FakePayload(now)
  togglesFake.global.autoArchiveCommentsEnabled = false
  const togglesResult = await runArchiveMaintenance(togglesFake as unknown as Payload, { force: true, now })
  assert(togglesResult.commentsArchived === 0, 'comment automation toggle should be independent')
  assert(togglesResult.postsArchived === 1, 'post automation should remain enabled')

  const dryRunFake = new FakePayload(now)
  const dryRun = await runArchiveMaintenance(dryRunFake as unknown as Payload, { dryRun: true, force: true, now })
  assert(dryRun.postsArchived === 1 && dryRun.commentsArchived === 1, 'dry run should count candidates')
  assert(dryRunFake.archivedPosts.length === 0 && dryRunFake.archivedComments.length === 0, 'dry run must not mutate')

  const manualFake = new FakePayload(now)
  await archivePost({
    payload: manualFake as unknown as Payload,
    postId: 'legacy-pending-post',
    user: { id: 'editor-1' },
    retentionDays: 30,
  })
  assert(manualFake.archivedPosts.length === 1, 'legacy pending posts should support manual archive')

  console.log('Archive verification passed')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
