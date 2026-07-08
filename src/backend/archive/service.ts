import type { Payload, Where } from 'payload'

import {
  ARCHIVE_RETENTION_DAYS,
  ARCHIVE_STATUS_MESSAGE,
  DELETE_STATUS_MESSAGE,
  RESTORE_STATUS_MESSAGE,
} from './constants'
import {
  daysAgoCutoff,
  getPostArchiveThresholdDays,
  isArchivedPostRestorable,
  isArchiveScheduleDue,
} from './helpers'

interface ArchiveConfigShape {
  commentDeletionThreshold?: number | null
  postArchiveThreshold?: string | null
  autoArchiveEnabled?: boolean | null
  jobSchedule?: string | null
  dryRunEnabled?: boolean | null
  lastRunAt?: string | null
}

interface ArchiveUser {
  id?: string
}

interface ArchiveRunOptions {
  dryRun?: boolean
  force?: boolean
  now?: Date
}

interface ArchiveError {
  id: string
  operation: string
  message: string
}

interface ArchiveRunResult {
  commentsDeleted: number
  postsArchived: number
  archiveRecordsDeleted: number
  skipped: boolean
  dryRun: boolean
  errors: ArchiveError[]
}

type ReviewPost = {
  id: string
  title?: string | null
  authors?: unknown
  _status?: string
  reviewStatus?: string | null
  archiveStatus?: string | null
  archivedStatus?: string | null
  archivedAt?: string | null
  archivedBy?: string | ArchiveUser | null
  archiveReason?: 'manual' | 'automated' | null
  reviewQueueAgeStartedAt?: string | null
  postAgeReferenceTimestamp?: string | null
  statusMessage?: string | null
  createdAt?: string | null
  submittedForReviewAt?: string | null
}

type ArchivedPostRecord = {
  id: string
  post?: string | ReviewPost | null
  postTitle?: string | null
  archivedAt?: string | null
}

const activeArchiveWhere: Where = {
  and: [
    {
      or: [
        { archiveStatus: { exists: false } },
        { archiveStatus: { equals: 'active' } },
      ],
    },
    {
      or: [
        { archivedStatus: { exists: false } },
        { archivedStatus: { equals: 'active' } },
      ],
    },
  ],
}

export async function getArchiveConfig(payload: Payload): Promise<ArchiveConfigShape> {
  try {
    return await payload.findGlobal({
      slug: 'archive-config',
      depth: 0,
      overrideAccess: true,
    }) as ArchiveConfigShape
  } catch {
    try {
      const legacyPayload = payload as unknown as {
        findGlobal: (args: { slug: string; depth: number; overrideAccess: boolean }) => Promise<ArchiveConfigShape>
      }
      return await legacyPayload.findGlobal({
        slug: 'lifecycle-config',
        depth: 0,
        overrideAccess: true,
      })
    } catch {
      return {
        commentDeletionThreshold: 60,
        postArchiveThreshold: '60-days',
        autoArchiveEnabled: true,
        jobSchedule: 'daily',
        dryRunEnabled: true,
      }
    }
  }
}

export function getContributorId(post: ReviewPost): string | null {
  const authors = post.authors
  if (!Array.isArray(authors) || authors.length === 0) return null
  const firstAuthor = authors[0]
  if (typeof firstAuthor === 'string') return firstAuthor
  if (typeof firstAuthor === 'object' && firstAuthor && 'id' in firstAuthor) {
    return String((firstAuthor as { id: unknown }).id)
  }
  if (firstAuthor && typeof firstAuthor === 'object' && typeof firstAuthor.toString === 'function') {
    const value = firstAuthor.toString()
    return value === '[object Object]' ? null : value
  }
  return null
}

export function getActiveArchiveWhere(): Where {
  return activeArchiveWhere
}

function getUserId(value: unknown): string | undefined {
  if (!value) return undefined
  if (typeof value === 'string') return value
  if (typeof value === 'object' && 'id' in value) return String((value as { id: unknown }).id)
  return undefined
}

function getRawPostsCollection(payload: Payload) {
  const db = (payload as unknown as {
    db?: {
      connection?: {
        db?: {
          collection: (name: string) => {
            find: (query: Record<string, unknown>) => {
              limit: (limit: number) => {
                toArray: () => Promise<Array<Record<string, unknown>>>
              }
            }
          }
        }
      }
    }
  }).db

  return db?.connection?.db?.collection('posts')
}

function normalizeRawPost(doc: Record<string, unknown>): ReviewPost {
  return {
    ...(doc as ReviewPost),
    id: String(doc.id || doc._id),
  }
}

export async function syncLegacyArchivedPosts(payload: Payload) {
  const rawPosts = getRawPostsCollection(payload)
  let legacyArchivedDocs: ReviewPost[] = []

  try {
    const legacyArchived = await payload.find({
      collection: 'posts',
      where: {
        archivedStatus: {
          equals: 'archived',
        },
      },
      depth: 1,
      draft: true,
      limit: 1000,
      overrideAccess: true,
    })
    legacyArchivedDocs = legacyArchived.docs as ReviewPost[]
  } catch {
    legacyArchivedDocs = []
  }

  if (legacyArchivedDocs.length === 0 && rawPosts) {
    const rawArchived = await rawPosts.find({ archivedStatus: 'archived' }).limit(1000).toArray()
    legacyArchivedDocs = rawArchived.map(normalizeRawPost)
  }

  let synced = 0
  for (const post of legacyArchivedDocs) {
    const contributorId = getContributorId(post)
    if (!contributorId) continue

    const existing = await payload.find({
      collection: 'archived-posts',
      where: {
        post: {
          equals: post.id,
        },
      },
      depth: 0,
      limit: 1,
      overrideAccess: true,
    })

    if (existing.totalDocs === 0) {
      await payload.create({
        collection: 'archived-posts',
        data: {
          post: post.id,
          postTitle: post.title || 'Untitled post',
          contributor: contributorId,
          archivedAt: post.archivedAt || new Date().toISOString(),
          archivedBy: getUserId(post.archivedBy),
          archiveReason: post.archiveReason || 'manual',
          statusMessage: post.statusMessage || ARCHIVE_STATUS_MESSAGE,
          reviewQueueAgeStartedAt: post.reviewQueueAgeStartedAt || post.postAgeReferenceTimestamp || post.submittedForReviewAt || post.createdAt,
        },
        overrideAccess: true,
      })
    }

    if (post.archiveStatus !== 'archived') {
      await payload.update({
        collection: 'posts',
        id: post.id,
        data: {
          archiveStatus: 'archived',
          statusMessage: post.statusMessage || ARCHIVE_STATUS_MESSAGE,
          reviewQueueAgeStartedAt: null,
        },
        draft: true,
        overrideAccess: true,
      })
    }

    synced++
  }

  let legacyDeletedDocs: ReviewPost[] = []
  try {
    const legacyDeleted = await payload.find({
      collection: 'posts',
      where: {
        archivedStatus: {
          equals: 'deleted',
        },
      },
      depth: 0,
      draft: true,
      limit: 1000,
      overrideAccess: true,
    })
    legacyDeletedDocs = legacyDeleted.docs as ReviewPost[]
  } catch {
    legacyDeletedDocs = []
  }

  if (legacyDeletedDocs.length === 0 && rawPosts) {
    const rawDeleted = await rawPosts.find({ archivedStatus: 'deleted' }).limit(1000).toArray()
    legacyDeletedDocs = rawDeleted.map(normalizeRawPost)
  }

  for (const post of legacyDeletedDocs) {
    if (post.archiveStatus === 'deleted') continue
    await payload.update({
      collection: 'posts',
      id: post.id,
      data: {
        archiveStatus: 'deleted',
        statusMessage: post.statusMessage || DELETE_STATUS_MESSAGE,
        reviewQueueAgeStartedAt: null,
      },
      draft: true,
      overrideAccess: true,
    })
    synced++
  }

  return synced
}

export async function findEligibleCommentsForDeletion(
  payload: Payload,
  config: ArchiveConfigShape,
  now = new Date(),
) {
  const commentThreshold = config.commentDeletionThreshold || 60
  return payload.find({
    collection: 'comments',
    where: {
      and: [
        { status: { equals: 'pending' } },
        { createdAt: { less_than_equal: daysAgoCutoff(commentThreshold, now) } },
      ],
    },
    depth: 0,
    limit: 1000,
    sort: 'createdAt',
  })
}

export async function findEligiblePostsForArchive(
  payload: Payload,
  config: ArchiveConfigShape,
  now = new Date(),
) {
  const thresholdDays = getPostArchiveThresholdDays(config.postArchiveThreshold)
  return payload.find({
    collection: 'posts',
    where: {
      and: [
        { _status: { equals: 'draft' } },
        { reviewStatus: { equals: 'pending_review' } },
        activeArchiveWhere,
        {
          or: [
            { reviewQueueAgeStartedAt: { less_than_equal: daysAgoCutoff(thresholdDays, now) } },
            {
              and: [
                { reviewQueueAgeStartedAt: { exists: false } },
                { postAgeReferenceTimestamp: { less_than_equal: daysAgoCutoff(thresholdDays, now) } },
              ],
            },
          ],
        },
      ],
    },
    depth: 1,
    draft: true,
    limit: 1000,
    sort: 'reviewQueueAgeStartedAt',
  })
}

export async function findExpiredArchivedPosts(payload: Payload, now = new Date()) {
  return payload.find({
    collection: 'archived-posts',
    where: {
      archivedAt: {
        less_than_equal: daysAgoCutoff(ARCHIVE_RETENTION_DAYS, now),
      },
    },
    depth: 2,
    limit: 1000,
    sort: 'archivedAt',
  })
}

export async function archivePost({
  payload,
  postId,
  user,
  reason = 'manual',
}: {
  payload: Payload
  postId: string
  user?: ArchiveUser | null
  reason?: 'manual' | 'automated'
}) {
  const post = await payload.findByID({
    collection: 'posts',
    id: postId,
    depth: 1,
    draft: true,
  }) as ReviewPost | null

  if (!post) throw new Error('Post not found in review queue')
  if (post._status !== 'draft' || post.reviewStatus !== 'pending_review') {
    throw new Error('Post not found in review queue')
  }
  const legacyStatus = post.archivedStatus
  if ((post.archiveStatus && post.archiveStatus !== 'active') || (legacyStatus && legacyStatus !== 'active')) {
    throw new Error('Post is already archived or deleted')
  }

  const contributorId = getContributorId(post)
  if (!contributorId) throw new Error('Post has no contributor')
  const contributor = await payload.findByID({
    collection: 'users',
    id: contributorId,
    depth: 0,
    overrideAccess: true,
  }) as { role?: string } | null
  if (contributor?.role !== 'contributor') {
    throw new Error('Only contributor posts can be archived from the review queue')
  }

  const archivedAt = new Date().toISOString()

  const existingArchive = await payload.find({
    collection: 'archived-posts',
    where: {
      post: {
        equals: postId,
      },
    },
    depth: 0,
    limit: 1,
    overrideAccess: true,
  })
  if (existingArchive.totalDocs > 0) {
    throw new Error('Post is already archived')
  }

  await payload.create({
    collection: 'archived-posts',
    data: {
      post: post.id,
      postTitle: post.title || 'Untitled post',
      contributor: contributorId,
      archivedAt,
      archivedBy: user?.id,
      archiveReason: reason,
      statusMessage: ARCHIVE_STATUS_MESSAGE,
      reviewQueueAgeStartedAt: post.reviewQueueAgeStartedAt || post.postAgeReferenceTimestamp || post.submittedForReviewAt || post.createdAt,
    },
    overrideAccess: true,
  })

  return payload.update({
    collection: 'posts',
    id: postId,
    data: {
      archiveStatus: 'archived',
      statusMessage: ARCHIVE_STATUS_MESSAGE,
      reviewQueueAgeStartedAt: null,
    },
    draft: true,
    overrideAccess: true,
  })
}

export async function restoreArchivedPost({
  payload,
  archiveId,
  user,
}: {
  payload: Payload
  archiveId: string
  user?: ArchiveUser | null
}) {
  void user
  const archive = await payload.findByID({
    collection: 'archived-posts',
    id: archiveId,
    depth: 2,
    overrideAccess: true,
  }) as ArchivedPostRecord | null

  if (!archive) throw new Error('Post not found in archive')
  if (!isArchivedPostRestorable(archive.archivedAt)) {
    throw new Error('Post cannot be restored after 30 days')
  }

  const postId = typeof archive.post === 'object' && archive.post ? archive.post.id : archive.post
  if (!postId) throw new Error('Post not found in archive')

  const updatedPost = await payload.update({
    collection: 'posts',
    id: String(postId),
    data: {
      archiveStatus: 'active',
      reviewStatus: 'pending_review',
      statusMessage: RESTORE_STATUS_MESSAGE,
      reviewQueueAgeStartedAt: new Date().toISOString(),
    },
    draft: true,
    overrideAccess: true,
  })

  await payload.delete({
    collection: 'archived-posts',
    id: archiveId,
    overrideAccess: true,
  })

  return updatedPost
}

export async function deleteArchivedPost({
  payload,
  archiveId,
  user,
}: {
  payload: Payload
  archiveId: string
  user?: ArchiveUser | null
}) {
  void user
  const archive = await payload.findByID({
    collection: 'archived-posts',
    id: archiveId,
    depth: 2,
    overrideAccess: true,
  }) as ArchivedPostRecord | null

  if (!archive) throw new Error('Post not found in archive')
  const postId = typeof archive.post === 'object' && archive.post ? archive.post.id : archive.post

  if (postId) {
    await payload.update({
      collection: 'posts',
      id: String(postId),
      data: {
        archiveStatus: 'deleted',
        statusMessage: DELETE_STATUS_MESSAGE,
        reviewQueueAgeStartedAt: null,
      },
      draft: true,
      overrideAccess: true,
    })
  }

  return payload.delete({
    collection: 'archived-posts',
    id: archiveId,
    overrideAccess: true,
  })
}

export async function runArchiveMaintenance(
  payload: Payload,
  options: ArchiveRunOptions = {},
): Promise<ArchiveRunResult> {
  const now = options.now || new Date()
  const config = await getArchiveConfig(payload)
  const dryRun = options.dryRun ?? Boolean(config.dryRunEnabled)
  const due = options.force || isArchiveScheduleDue(config.lastRunAt, config.jobSchedule, now)
  const errors: ArchiveError[] = []

  if (!due) {
    return {
      commentsDeleted: 0,
      postsArchived: 0,
      archiveRecordsDeleted: 0,
      skipped: true,
      dryRun,
      errors,
    }
  }

  const oldComments = await findEligibleCommentsForDeletion(payload, config, now)
  let commentsDeleted = 0
  for (const comment of oldComments.docs) {
    try {
      if (!dryRun) {
        await payload.delete({
          collection: 'comments',
          id: comment.id,
          overrideAccess: true,
        })
      }
      commentsDeleted++
    } catch (error) {
      errors.push({
        id: String(comment.id),
        operation: 'delete_pending_comment',
        message: error instanceof Error ? error.message : 'Failed to delete pending comment',
      })
    }
  }

  let postsArchived = 0
  if (config.autoArchiveEnabled !== false) {
    const eligiblePosts = await findEligiblePostsForArchive(payload, config, now)
    for (const post of eligiblePosts.docs as ReviewPost[]) {
      try {
        if (!dryRun) {
          await archivePost({
            payload,
            postId: post.id,
            reason: 'automated',
          })
        }
        postsArchived++
      } catch (error) {
        errors.push({
          id: String(post.id),
          operation: 'archive_post',
          message: error instanceof Error ? error.message : 'Failed to archive post',
        })
      }
    }
  }

  const expiredArchives = await findExpiredArchivedPosts(payload, now)
  let archiveRecordsDeleted = 0
  for (const archive of expiredArchives.docs as ArchivedPostRecord[]) {
    try {
      if (!dryRun) {
        await deleteArchivedPost({
          payload,
          archiveId: archive.id,
        })
      }
      archiveRecordsDeleted++
    } catch (error) {
      errors.push({
        id: String(archive.id),
        operation: 'delete_archive_record',
        message: error instanceof Error ? error.message : 'Failed to delete archived post',
      })
    }
  }

  if (!dryRun) {
    await payload.updateGlobal({
      slug: 'archive-config',
      data: {
        lastRunAt: now.toISOString(),
      },
      overrideAccess: true,
    })
  }

  return {
    commentsDeleted,
    postsArchived,
    archiveRecordsDeleted,
    skipped: false,
    dryRun,
    errors,
  }
}

export function summarizeArchiveRun(result: ArchiveRunResult): string {
  const prefix = result.dryRun ? 'Archive maintenance dry run' : 'Archive maintenance completed'
  if (result.skipped) return `${prefix}: skipped until configured schedule is due`

  return `${prefix}: ${result.commentsDeleted} pending comments deleted, ${result.postsArchived} posts archived, ${result.archiveRecordsDeleted} archive records deleted, ${result.errors.length} errors`
}
