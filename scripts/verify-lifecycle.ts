import type { Payload } from 'payload'

import {
  ARCHIVE_STATUS_MESSAGE,
  DELETE_STATUS_MESSAGE,
  RESTORE_STATUS_MESSAGE,
} from '../src/backend/lifecycle/constants'
import {
  daysAgoCutoff,
  getPostArchiveThresholdDays,
  isArchivedPostRestorable,
  isLifecycleScheduleDue,
} from '../src/backend/lifecycle/helpers'
import {
  archivePost,
  findEligiblePostsForArchive,
  restoreArchivedPost,
  runLifecycleMaintenance,
  softDeleteArchivedPost,
} from '../src/backend/lifecycle/service'

interface FakePost {
  id: string
  title: string
  _status: string
  reviewStatus: string
  archivedStatus?: string
  postAgeReferenceTimestamp: string
  archivedAt?: string | null
  statusMessage?: string | null
  archiveReason?: string | null
  lifecycleDeletedAt?: string | null
  authors: Array<string | { id: string; role?: string; name?: string }>
}

interface FakeComment {
  id: string
  createdAt: string
}

interface FakeNotice {
  id: string
  post: string
  postTitle: string
  contributor: string
  type: string
  message: string
}

interface FakeUser {
  id: string
  role: string
}

interface FakeFindResult<T> {
  docs: T[]
  totalDocs: number
  totalPages: number
}

class FakePayload {
  posts: FakePost[]
  comments: FakeComment[]
  users: FakeUser[]
  notices: FakeNotice[] = []
  failDeleteCommentId: string | null = null
  now: Date
  global = {
    commentDeletionThreshold: 60,
    postArchiveThreshold: '60-days',
    autoArchiveEnabled: true,
    jobSchedule: 'daily',
    dryRunEnabled: false,
    lastRunAt: null as string | null,
  }

  constructor(now: Date) {
    this.now = now
    this.users = [
      { id: 'contributor-1', role: 'contributor' },
      { id: 'editor-1', role: 'editor' },
    ]
    this.posts = [
      {
        id: 'old-post',
        title: 'Old post',
        _status: 'draft',
        reviewStatus: 'pending_review',
        archivedStatus: 'active',
        postAgeReferenceTimestamp: daysAgoCutoff(75, now),
        authors: [{ id: 'contributor-1', role: 'contributor', name: 'Contributor' }],
      },
      {
        id: 'new-post',
        title: 'New post',
        _status: 'draft',
        reviewStatus: 'pending_review',
        archivedStatus: 'active',
        postAgeReferenceTimestamp: daysAgoCutoff(10, now),
        authors: ['contributor-1'],
      },
    ]
    this.comments = [
      { id: 'old-comment', createdAt: daysAgoCutoff(90, now) },
      { id: 'new-comment', createdAt: daysAgoCutoff(2, now) },
    ]
  }

  async find(input: { collection: string; limit?: number }) {
    if (input.collection === 'comments') {
      const oldComments = this.comments.filter((comment) => comment.createdAt <= daysAgoCutoff(this.global.commentDeletionThreshold, this.now))
      return this.result(oldComments.slice(0, input.limit || 1000))
    }

    if (input.collection === 'posts') {
      const eligible = this.posts.filter((post) => {
        if (post.archivedStatus === 'archived') return true
        return (
          post._status === 'draft' &&
          post.reviewStatus === 'pending_review' &&
          (!post.archivedStatus || post.archivedStatus === 'active') &&
          post.postAgeReferenceTimestamp <= daysAgoCutoff(getPostArchiveThresholdDays(this.global.postArchiveThreshold), this.now)
        )
      })
      return this.result(eligible.slice(0, input.limit || 1000))
    }

    return this.result([])
  }

  async findByID(input: { collection: string; id: string }) {
    if (input.collection === 'posts') return this.posts.find((post) => post.id === input.id) || null
    if (input.collection === 'users') return this.users.find((user) => user.id === input.id) || null
    return null
  }

  async update(input: { collection: string; id: string; data: Record<string, unknown> }) {
    const post = this.posts.find((item) => item.id === input.id)
    if (!post) throw new Error('Post not found')
    Object.assign(post, input.data)
    return post
  }

  async create(input: { collection: string; data: Record<string, unknown> }) {
    if (input.collection !== 'lifecycle-notices') throw new Error('Unsupported collection')
    const notice = {
      id: `notice-${this.notices.length + 1}`,
      ...input.data,
    } as unknown as FakeNotice
    this.notices.push(notice)
    return notice
  }

  async delete(input: { collection: string; id: string }) {
    if (input.collection !== 'comments') throw new Error('Unsupported collection')
    if (input.id === this.failDeleteCommentId) throw new Error('Delete failed')
    this.comments = this.comments.filter((comment) => comment.id !== input.id)
  }

  async findGlobal() {
    return this.global
  }

  async updateGlobal(input: { data: { lastRunAt?: string } }) {
    this.global.lastRunAt = input.data.lastRunAt || this.global.lastRunAt
    return this.global
  }

  private result<T>(docs: T[]): FakeFindResult<T> {
    return {
      docs,
      totalDocs: docs.length,
      totalPages: 1,
    }
  }
}

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message)
}

async function main() {
  const now = new Date('2026-07-07T00:00:00.000Z')
  assert(getPostArchiveThresholdDays('15-days') === 15, '15 day threshold failed')
  assert(getPostArchiveThresholdDays('bad-value') === 60, 'default threshold failed')
  assert(isArchivedPostRestorable(daysAgoCutoff(29, now), now), '29-day archive should restore')
  assert(!isArchivedPostRestorable(daysAgoCutoff(30, now), now), '30-day archive should not restore')
  assert(isLifecycleScheduleDue(null, 'daily', now), 'empty lastRunAt should be due')
  assert(!isLifecycleScheduleDue(daysAgoCutoff(0.25, now), 'daily', now), 'daily schedule should not be due after 6h')

  const fake = new FakePayload(now)
  const payload = fake as unknown as Payload

  const eligible = await findEligiblePostsForArchive(payload, fake.global, now)
  assert(eligible.docs.length === 1, 'only one post should be eligible for archive')
  assert(eligible.docs[0].id === 'old-post', 'old post should be selected for archive')

  await archivePost({ payload, postId: 'old-post', user: { id: 'editor-1' } })
  assert(fake.posts[0].archivedStatus === 'archived', 'archive should set archived status')
  assert(fake.posts[0].statusMessage === ARCHIVE_STATUS_MESSAGE, 'archive message mismatch')
  assert(fake.notices[0].type === 'archived', 'archive notice missing')

  await restoreArchivedPost({ payload, postId: 'old-post', user: { id: 'editor-1' } })
  assert(fake.posts[0].archivedStatus === 'active', 'restore should reactivate post')
  assert(fake.posts[0].statusMessage === RESTORE_STATUS_MESSAGE, 'restore message mismatch')

  await archivePost({ payload, postId: 'old-post', user: { id: 'editor-1' } })
  await softDeleteArchivedPost({ payload, postId: 'old-post', user: { id: 'editor-1' } })
  assert(fake.posts[0].archivedStatus === 'deleted', 'soft delete should mark deleted')
  assert(fake.posts[0].statusMessage === DELETE_STATUS_MESSAGE, 'delete message mismatch')

  const resilientFake = new FakePayload(now)
  resilientFake.failDeleteCommentId = 'old-comment'
  const result = await runLifecycleMaintenance(resilientFake as unknown as Payload, { force: true, now })
  assert(result.errors.length === 1, 'batch error should be captured')
  assert(result.postsArchived === 1, 'post archive should continue after comment failure')

  const dryRunFake = new FakePayload(now)
  const dryRunResult = await runLifecycleMaintenance(dryRunFake as unknown as Payload, { dryRun: true, force: true, now })
  assert(dryRunResult.dryRun, 'dry run flag missing')
  assert(dryRunFake.posts[0].archivedStatus === 'active', 'dry run should not mutate posts')
  assert(dryRunFake.comments.length === 2, 'dry run should not delete comments')

  console.log('Lifecycle verification passed')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
