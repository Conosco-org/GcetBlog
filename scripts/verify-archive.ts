import type { Payload } from 'payload'

import {
  ARCHIVE_STATUS_MESSAGE,
  DELETE_STATUS_MESSAGE,
} from '../src/backend/archive/constants'
import {
  daysAgoCutoff,
  getPostArchiveThresholdDays,
  isArchivedPostRestorable,
  isArchiveScheduleDue,
} from '../src/backend/archive/helpers'
import {
  archivePost,
  deleteArchivedPost,
  findEligibleCommentsForDeletion,
  findEligiblePostsForArchive,
  restoreArchivedPost,
  runArchiveMaintenance,
} from '../src/backend/archive/service'

type FakePost = {
  id: string
  title: string
  authors: string[]
  _status: 'draft' | 'published'
  reviewStatus: string
  archiveStatus?: string
  reviewQueueAgeStartedAt?: string | null
  statusMessage?: string | null
  submittedForReviewAt?: string | null
  createdAt: string
  updatedAt: string
}

type FakeComment = {
  id: string
  status: string
  createdAt: string
}

type FakeArchive = {
  id: string
  post: string | FakePost
  postTitle: string
  contributor: string
  archivedAt: string
  archiveReason: string
  statusMessage: string
  reviewQueueAgeStartedAt?: string | null
}

type FakeArchiveGlobal = {
  commentDeletionThreshold: number
  postArchiveThreshold: string
  autoArchiveEnabled: boolean
  jobSchedule: string
  dryRunEnabled: boolean
  lastRunAt: string | null
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

function matchesEquals(value: unknown, expected: unknown) {
  if (Array.isArray(value)) return value.includes(expected)
  return value === expected
}

function matchesWhere(doc: Record<string, unknown>, where: Record<string, unknown>): boolean {
  if ('and' in where && Array.isArray(where.and)) {
    return where.and.every((item) => matchesWhere(doc, item as Record<string, unknown>))
  }
  if ('or' in where && Array.isArray(where.or)) {
    return where.or.some((item) => matchesWhere(doc, item as Record<string, unknown>))
  }

  return Object.entries(where).every(([field, condition]) => {
    const value = doc[field]
    if (!condition || typeof condition !== 'object') return value === condition
    const typedCondition = condition as Record<string, unknown>
    if ('equals' in typedCondition) return matchesEquals(value, typedCondition.equals)
    if ('exists' in typedCondition) return typedCondition.exists ? value !== undefined : value === undefined
    if ('less_than_equal' in typedCondition) return String(value) <= String(typedCondition.less_than_equal)
    if ('in' in typedCondition && Array.isArray(typedCondition.in)) {
      if (Array.isArray(value)) return value.some((item) => (typedCondition.in as unknown[]).includes(item))
      return typedCondition.in.includes(value)
    }
    return false
  })
}

class FakePayload {
  posts: FakePost[]
  comments: FakeComment[]
  archivedPosts: FakeArchive[]
  users = new Map<string, { id: string; role: string }>()
  global: FakeArchiveGlobal = {
    commentDeletionThreshold: 60,
    postArchiveThreshold: '60-days',
    autoArchiveEnabled: true,
    jobSchedule: 'daily',
    dryRunEnabled: false,
    lastRunAt: null as string | null,
  }
  failCommentDeleteId?: string

  constructor(now: Date) {
    this.posts = [
      {
        id: 'old-pending',
        title: 'Old pending post',
        authors: ['contributor-1'],
        _status: 'draft',
        reviewStatus: 'pending_review',
        archiveStatus: 'active',
        reviewQueueAgeStartedAt: daysAgoCutoff(75, now),
        createdAt: daysAgoCutoff(90, now),
        updatedAt: daysAgoCutoff(75, now),
      },
      {
        id: 'new-pending',
        title: 'New pending post',
        authors: ['contributor-1'],
        _status: 'draft',
        reviewStatus: 'pending_review',
        archiveStatus: 'active',
        reviewQueueAgeStartedAt: daysAgoCutoff(10, now),
        createdAt: daysAgoCutoff(10, now),
        updatedAt: daysAgoCutoff(10, now),
      },
      {
        id: 'published-old',
        title: 'Published old post',
        authors: ['contributor-1'],
        _status: 'published',
        reviewStatus: 'approved',
        archiveStatus: 'active',
        reviewQueueAgeStartedAt: daysAgoCutoff(90, now),
        createdAt: daysAgoCutoff(90, now),
        updatedAt: daysAgoCutoff(90, now),
      },
    ]
    this.comments = [
      { id: 'old-pending-comment', status: 'pending', createdAt: daysAgoCutoff(90, now) },
      { id: 'old-approved-comment', status: 'approved', createdAt: daysAgoCutoff(90, now) },
    ]
    this.archivedPosts = []
    this.users.set('contributor-1', { id: 'contributor-1', role: 'contributor' })
  }

  async findGlobal() {
    return this.global
  }

  async updateGlobal(input: { data: Partial<FakeArchiveGlobal> }) {
    this.global = { ...this.global, ...input.data }
    return this.global
  }

  async find(input: { collection: string; where?: Record<string, unknown>; limit?: number }) {
    const source =
      input.collection === 'posts'
        ? this.posts
        : input.collection === 'comments'
          ? this.comments
          : input.collection === 'archived-posts'
            ? this.archivedPosts
            : []
    const docs = input.where
      ? source.filter((doc) => matchesWhere(doc as unknown as Record<string, unknown>, input.where!))
      : source
    const limitedDocs = input.limit ? docs.slice(0, input.limit) : docs
    return {
      docs: limitedDocs,
      totalDocs: limitedDocs.length,
    }
  }

  async findByID(input: { collection: string; id: string }) {
    if (input.collection === 'posts') return this.posts.find((post) => post.id === input.id) || null
    if (input.collection === 'users') return this.users.get(input.id) || null
    if (input.collection === 'archived-posts') {
      const archive = this.archivedPosts.find((item) => item.id === input.id)
      if (!archive) return null
      const post = this.posts.find((item) => item.id === archive.post)
      return {
        ...archive,
        post: post || archive.post,
      }
    }
    return null
  }

  async create(input: { collection: string; data: Record<string, unknown> }) {
    if (input.collection !== 'archived-posts') throw new Error(`Unsupported create ${input.collection}`)
    const archive = {
      id: `archive-${this.archivedPosts.length + 1}`,
      ...input.data,
    } as FakeArchive
    this.archivedPosts.push(archive)
    return archive
  }

  async update(input: { collection: string; id: string; data: Partial<FakePost> }) {
    if (input.collection !== 'posts') throw new Error(`Unsupported update ${input.collection}`)
    const post = this.posts.find((item) => item.id === input.id)
    if (!post) throw new Error('Post not found')
    Object.assign(post, input.data)
    return post
  }

  async delete(input: { collection: string; id: string }) {
    if (input.collection === 'comments') {
      if (input.id === this.failCommentDeleteId) throw new Error('comment delete failed')
      this.comments = this.comments.filter((comment) => comment.id !== input.id)
      return { id: input.id }
    }
    if (input.collection === 'archived-posts') {
      this.archivedPosts = this.archivedPosts.filter((archive) => archive.id !== input.id)
      return { id: input.id }
    }
    throw new Error(`Unsupported delete ${input.collection}`)
  }
}

async function main() {
  const now = new Date('2026-07-08T00:00:00.000Z')
  const fake = new FakePayload(now)
  const payload = fake as unknown as Payload

  assert(getPostArchiveThresholdDays('15-days') === 15, '15-day threshold mismatch')
  assert(isArchiveScheduleDue(null, 'daily', now), 'empty lastRunAt should be due')
  assert(!isArchiveScheduleDue(daysAgoCutoff(0.25, now), 'daily', now), 'daily schedule should not be due after 6h')
  assert(isArchivedPostRestorable(daysAgoCutoff(29, now), now), '29-day archive should restore')
  assert(!isArchivedPostRestorable(daysAgoCutoff(30, now), now), '30-day archive should not restore')

  const eligibleComments = await findEligibleCommentsForDeletion(payload, fake.global, now)
  assert(eligibleComments.docs.length === 1, 'only pending old comments should be eligible')
  assert(eligibleComments.docs[0].id === 'old-pending-comment', 'approved live comments must be ignored')

  const eligiblePosts = await findEligiblePostsForArchive(payload, fake.global, now)
  assert(eligiblePosts.docs.length === 1, 'only one post should be eligible for archive')
  assert(eligiblePosts.docs[0].id === 'old-pending', 'published/live posts must be ignored')

  await archivePost({ payload, postId: 'old-pending', user: { id: 'editor-1' } })
  assert(String(fake.posts[0].archiveStatus) === 'archived', 'archive should mark source post archived')
  assert(fake.posts[0].reviewQueueAgeStartedAt === null, 'archive should stop review queue age')
  assert(String(fake.posts[0].statusMessage) === ARCHIVE_STATUS_MESSAGE, 'archive message mismatch')
  assert(Number(fake.archivedPosts.length) === 1, 'archive record should be created')

  await restoreArchivedPost({ payload, archiveId: 'archive-1', user: { id: 'editor-1' } })
  assert(String(fake.posts[0].archiveStatus) === 'active', 'restore should reactivate source post')
  assert(fake.posts[0].reviewStatus === 'pending_review', 'restore should return to pending review')
  assert(Boolean(fake.posts[0].reviewQueueAgeStartedAt), 'restore should reset review queue age')
  assert(Number(fake.archivedPosts.length) === 0, 'restore should hard-delete archive record')

  await archivePost({ payload, postId: 'old-pending', user: { id: 'editor-1' } })
  await deleteArchivedPost({ payload, archiveId: 'archive-1', user: { id: 'editor-1' } })
  assert(String(fake.posts[0].archiveStatus) === 'deleted', 'delete should mark source post deleted')
  assert(String(fake.posts[0].statusMessage) === DELETE_STATUS_MESSAGE, 'delete message mismatch')
  assert(Number(fake.archivedPosts.length) === 0, 'delete should hard-delete archive record')

  const resilientFake = new FakePayload(now)
  resilientFake.failCommentDeleteId = 'old-pending-comment'
  const result = await runArchiveMaintenance(resilientFake as unknown as Payload, { force: true, now })
  assert(result.errors.length === 1, 'comment delete failure should be recorded')
  assert(result.postsArchived === 1, 'post archive should continue after comment failure')

  const dryRunFake = new FakePayload(now)
  const dryRunResult = await runArchiveMaintenance(dryRunFake as unknown as Payload, { dryRun: true, force: true, now })
  assert(dryRunResult.postsArchived === 1, 'dry run should report archive candidate')
  assert(String(dryRunFake.posts[0].archiveStatus) === 'active', 'dry run should not mutate posts')
  assert(Number(dryRunFake.archivedPosts.length) === 0, 'dry run should not create archive records')

  console.log('Archive verification passed')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
