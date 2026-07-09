import type { Payload, Where } from 'payload'

import {
  DEFAULT_COMMENT_ARCHIVE_RETENTION_DAYS,
  DEFAULT_COMMENT_QUEUE_RETENTION_DAYS,
  DEFAULT_POST_ARCHIVE_RETENTION_DAYS,
  DEFAULT_POST_QUEUE_RETENTION_DAYS,
  RESTORE_STATUS_MESSAGE,
  getArchiveStatusMessage,
  getDeleteStatusMessage,
} from './constants'
import {
  daysAgoCutoff,
  isArchivedItemRestorable,
  isArchiveScheduleDue,
  normalizeRetentionDays,
} from './helpers'

export interface ArchiveConfigShape {
  postQueueRetentionDays?: number | null
  postArchiveRetentionDays?: number | null
  commentQueueRetentionDays?: number | null
  commentArchiveRetentionDays?: number | null
  autoArchivePostsEnabled?: boolean | null
  autoArchiveCommentsEnabled?: boolean | null
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

export interface ArchiveRunResult {
  commentsArchived: number
  postsArchived: number
  archivedCommentsDeleted: number
  archivedPostsDeleted: number
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
  reviewQueueAgeStartedAt?: string | null
}

type PendingComment = {
  id: string
  content?: string | null
  status?: string | null
  post?: string | { id: string } | null
  author?: string | { id: string; name?: string | null; email?: string | null } | null
  authorName?: string | null
  authorEmail?: string | null
  reviewQueueAgeStartedAt?: string | null
}

type ArchivedPostRecord = {
  id: string
  post?: string | ReviewPost | null
  archivedAt?: string | null
}

type ArchivedCommentRecord = {
  id: string
  comment?: string | PendingComment | null
  archivedAt?: string | null
}

const activeArchiveWhere: Where = {
  or: [
    { archiveStatus: { exists: false } },
    { archiveStatus: { equals: 'active' } },
  ],
}

export const ARCHIVE_CONFIG_DEFAULTS = {
  postQueueRetentionDays: DEFAULT_POST_QUEUE_RETENTION_DAYS,
  postArchiveRetentionDays: DEFAULT_POST_ARCHIVE_RETENTION_DAYS,
  commentQueueRetentionDays: DEFAULT_COMMENT_QUEUE_RETENTION_DAYS,
  commentArchiveRetentionDays: DEFAULT_COMMENT_ARCHIVE_RETENTION_DAYS,
  autoArchivePostsEnabled: true,
  autoArchiveCommentsEnabled: true,
  jobSchedule: 'daily',
  dryRunEnabled: true,
} as const

export function normalizeArchiveConfig(config: ArchiveConfigShape = {}) {
  return {
    postQueueRetentionDays: normalizeRetentionDays(
      config.postQueueRetentionDays,
      ARCHIVE_CONFIG_DEFAULTS.postQueueRetentionDays,
    ),
    postArchiveRetentionDays: normalizeRetentionDays(
      config.postArchiveRetentionDays,
      ARCHIVE_CONFIG_DEFAULTS.postArchiveRetentionDays,
    ),
    commentQueueRetentionDays: normalizeRetentionDays(
      config.commentQueueRetentionDays,
      ARCHIVE_CONFIG_DEFAULTS.commentQueueRetentionDays,
    ),
    commentArchiveRetentionDays: normalizeRetentionDays(
      config.commentArchiveRetentionDays,
      ARCHIVE_CONFIG_DEFAULTS.commentArchiveRetentionDays,
    ),
    autoArchivePostsEnabled: config.autoArchivePostsEnabled !== false,
    autoArchiveCommentsEnabled: config.autoArchiveCommentsEnabled !== false,
    jobSchedule: config.jobSchedule || ARCHIVE_CONFIG_DEFAULTS.jobSchedule,
    dryRunEnabled: config.dryRunEnabled !== false,
    lastRunAt: config.lastRunAt || null,
  }
}

export async function getArchiveConfig(payload: Payload) {
  try {
    const config = await payload.findGlobal({
      slug: 'archive-config',
      depth: 0,
      overrideAccess: true,
    }) as ArchiveConfigShape
    return normalizeArchiveConfig(config)
  } catch {
    return normalizeArchiveConfig()
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
  return null
}

function getRelationshipId(value: string | { id: string } | null | undefined): string | null {
  if (typeof value === 'string') return value
  return value?.id ? String(value.id) : null
}

export function getActiveArchiveWhere(): Where {
  return activeArchiveWhere
}

export async function findEligibleCommentsForArchive(
  payload: Payload,
  config: ArchiveConfigShape,
  now = new Date(),
) {
  const normalized = normalizeArchiveConfig(config)
  return payload.find({
    collection: 'comments',
    where: {
      and: [
        { status: { equals: 'pending' } },
        {
          reviewQueueAgeStartedAt: {
            less_than_equal: daysAgoCutoff(normalized.commentQueueRetentionDays, now),
          },
        },
      ],
    },
    depth: 0,
    limit: 1000,
    sort: 'reviewQueueAgeStartedAt',
  })
}

export async function findEligiblePostsForArchive(
  payload: Payload,
  config: ArchiveConfigShape,
  now = new Date(),
) {
  const normalized = normalizeArchiveConfig(config)
  return payload.find({
    collection: 'posts',
    where: {
      and: [
        { _status: { equals: 'draft' } },
        { reviewStatus: { equals: 'pending_review' } },
        activeArchiveWhere,
        {
          reviewQueueAgeStartedAt: {
            less_than_equal: daysAgoCutoff(normalized.postQueueRetentionDays, now),
          },
        },
      ],
    },
    depth: 1,
    draft: true,
    limit: 1000,
    sort: 'reviewQueueAgeStartedAt',
  })
}

export async function findExpiredArchivedPosts(
  payload: Payload,
  retentionDays: number,
  now = new Date(),
) {
  return payload.find({
    collection: 'archived-posts',
    where: { archivedAt: { less_than_equal: daysAgoCutoff(retentionDays, now) } },
    depth: 2,
    limit: 1000,
    sort: 'archivedAt',
  })
}

export async function findExpiredArchivedComments(
  payload: Payload,
  retentionDays: number,
  now = new Date(),
) {
  return payload.find({
    collection: 'archived-comments',
    where: { archivedAt: { less_than_equal: daysAgoCutoff(retentionDays, now) } },
    depth: 1,
    limit: 1000,
    sort: 'archivedAt',
  })
}

export async function archivePost({
  payload,
  postId,
  user,
  reason = 'manual',
  retentionDays,
}: {
  payload: Payload
  postId: string
  user?: ArchiveUser | null
  reason?: 'manual' | 'automated'
  retentionDays?: number
}) {
  const config = retentionDays ? null : await getArchiveConfig(payload)
  const archiveRetentionDays = retentionDays || config!.postArchiveRetentionDays
  const statusMessage = getArchiveStatusMessage(archiveRetentionDays)
  const post = await payload.findByID({
    collection: 'posts',
    id: postId,
    depth: 1,
    draft: true,
  }) as ReviewPost | null

  if (!post || post._status !== 'draft' || post.reviewStatus !== 'pending_review') {
    throw new Error('Post not found in review queue')
  }
  if (post.archiveStatus && post.archiveStatus !== 'active') {
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

  const existingArchive = await payload.find({
    collection: 'archived-posts',
    where: { post: { equals: postId } },
    depth: 0,
    limit: 1,
    overrideAccess: true,
  })
  if (existingArchive.totalDocs > 0) throw new Error('Post is already archived')

  const archive = await payload.create({
    collection: 'archived-posts',
    data: {
      post: post.id,
      postTitle: post.title || 'Untitled post',
      contributor: contributorId,
      archivedAt: new Date().toISOString(),
      archivedBy: user?.id,
      archiveReason: reason,
      statusMessage,
      reviewQueueAgeStartedAt: post.reviewQueueAgeStartedAt,
    },
    overrideAccess: true,
  })

  try {
    return await payload.update({
      collection: 'posts',
      id: postId,
      data: {
        archiveStatus: 'archived',
        statusMessage,
        reviewQueueAgeStartedAt: null,
      },
      draft: true,
      overrideAccess: true,
    })
  } catch (error) {
    await payload.delete({
      collection: 'archived-posts',
      id: archive.id,
      overrideAccess: true,
    })
    throw error
  }
}

export async function archiveComment({
  payload,
  commentId,
  user,
  reason = 'manual',
}: {
  payload: Payload
  commentId: string
  user?: ArchiveUser | null
  reason?: 'manual' | 'automated'
}) {
  const comment = await payload.findByID({
    collection: 'comments',
    id: commentId,
    depth: 1,
    overrideAccess: true,
  }) as PendingComment | null
  if (!comment || comment.status !== 'pending') {
    throw new Error('Comment not found in moderation queue')
  }

  const postId = getRelationshipId(comment.post)
  if (!postId) throw new Error('Comment has no source post')
  const existingArchive = await payload.find({
    collection: 'archived-comments',
    where: { comment: { equals: commentId } },
    depth: 0,
    limit: 1,
    overrideAccess: true,
  })
  if (existingArchive.totalDocs > 0) throw new Error('Comment is already archived')

  const authorId = getRelationshipId(comment.author)
  const populatedAuthor = typeof comment.author === 'object' ? comment.author : null
  const archive = await payload.create({
    collection: 'archived-comments',
    data: {
      comment: comment.id,
      contentSnapshot: comment.content || '',
      post: postId,
      author: authorId || undefined,
      authorName: populatedAuthor?.name || comment.authorName || undefined,
      authorEmail: populatedAuthor?.email || comment.authorEmail || undefined,
      archivedAt: new Date().toISOString(),
      archivedBy: user?.id,
      archiveReason: reason,
      reviewQueueAgeStartedAt: comment.reviewQueueAgeStartedAt,
    },
    overrideAccess: true,
  })

  try {
    return await payload.update({
      collection: 'comments',
      id: commentId,
      data: {
        status: 'archived',
        reviewQueueAgeStartedAt: null,
      },
      overrideAccess: true,
    })
  } catch (error) {
    await payload.delete({
      collection: 'archived-comments',
      id: archive.id,
      overrideAccess: true,
    })
    throw error
  }
}

export async function restoreArchivedPost({
  payload,
  archiveId,
}: {
  payload: Payload
  archiveId: string
  user?: ArchiveUser | null
}) {
  const config = await getArchiveConfig(payload)
  const archive = await payload.findByID({
    collection: 'archived-posts',
    id: archiveId,
    depth: 2,
    overrideAccess: true,
  }) as ArchivedPostRecord | null
  if (!archive) throw new Error('Post not found in archive')
  if (!isArchivedItemRestorable(archive.archivedAt, config.postArchiveRetentionDays)) {
    throw new Error(`Post cannot be restored after ${config.postArchiveRetentionDays} days`)
  }

  const postId = getRelationshipId(archive.post)
  if (!postId) throw new Error('Post not found in archive')
  const updatedPost = await payload.update({
    collection: 'posts',
    id: postId,
    data: {
      archiveStatus: 'active',
      reviewStatus: 'pending_review',
      statusMessage: RESTORE_STATUS_MESSAGE,
      reviewQueueAgeStartedAt: new Date().toISOString(),
    },
    draft: true,
    overrideAccess: true,
  })
  await payload.delete({ collection: 'archived-posts', id: archiveId, overrideAccess: true })
  return updatedPost
}

export async function restoreArchivedComment({
  payload,
  archiveId,
}: {
  payload: Payload
  archiveId: string
  user?: ArchiveUser | null
}) {
  const config = await getArchiveConfig(payload)
  const archive = await payload.findByID({
    collection: 'archived-comments',
    id: archiveId,
    depth: 1,
    overrideAccess: true,
  }) as ArchivedCommentRecord | null
  if (!archive) throw new Error('Comment not found in archive')
  if (!isArchivedItemRestorable(archive.archivedAt, config.commentArchiveRetentionDays)) {
    throw new Error(`Comment cannot be restored after ${config.commentArchiveRetentionDays} days`)
  }

  const commentId = getRelationshipId(archive.comment)
  if (!commentId) throw new Error('Comment not found in archive')
  const updatedComment = await payload.update({
    collection: 'comments',
    id: commentId,
    data: {
      status: 'pending',
      reviewQueueAgeStartedAt: new Date().toISOString(),
    },
    overrideAccess: true,
  })
  await payload.delete({ collection: 'archived-comments', id: archiveId, overrideAccess: true })
  return updatedComment
}

export async function deleteArchivedPost({
  payload,
  archiveId,
}: {
  payload: Payload
  archiveId: string
  user?: ArchiveUser | null
}) {
  const config = await getArchiveConfig(payload)
  const archive = await payload.findByID({
    collection: 'archived-posts',
    id: archiveId,
    depth: 2,
    overrideAccess: true,
  }) as ArchivedPostRecord | null
  if (!archive) throw new Error('Post not found in archive')

  const postId = getRelationshipId(archive.post)
  if (postId) {
    await payload.update({
      collection: 'posts',
      id: postId,
      data: {
        archiveStatus: 'deleted',
        statusMessage: getDeleteStatusMessage(config.postArchiveRetentionDays),
        reviewQueueAgeStartedAt: null,
      },
      draft: true,
      overrideAccess: true,
    })
  }
  return payload.delete({ collection: 'archived-posts', id: archiveId, overrideAccess: true })
}

export async function deleteArchivedComment({
  payload,
  archiveId,
}: {
  payload: Payload
  archiveId: string
  user?: ArchiveUser | null
}) {
  const archive = await payload.findByID({
    collection: 'archived-comments',
    id: archiveId,
    depth: 1,
    overrideAccess: true,
  }) as ArchivedCommentRecord | null
  if (!archive) throw new Error('Comment not found in archive')

  const commentId = getRelationshipId(archive.comment)
  if (commentId) {
    try {
      await payload.delete({ collection: 'comments', id: commentId, overrideAccess: true })
    } catch (error) {
      const message = error instanceof Error ? error.message : ''
      if (!message.toLowerCase().includes('not found')) throw error
    }
  }
  return payload.delete({ collection: 'archived-comments', id: archiveId, overrideAccess: true })
}

export async function runArchiveMaintenance(
  payload: Payload,
  options: ArchiveRunOptions = {},
): Promise<ArchiveRunResult> {
  const now = options.now || new Date()
  const config = await getArchiveConfig(payload)
  const dryRun = options.dryRun ?? config.dryRunEnabled
  const due = options.force || isArchiveScheduleDue(config.lastRunAt, config.jobSchedule, now)
  const errors: ArchiveError[] = []
  const result: ArchiveRunResult = {
    commentsArchived: 0,
    postsArchived: 0,
    archivedCommentsDeleted: 0,
    archivedPostsDeleted: 0,
    skipped: !due,
    dryRun,
    errors,
  }
  if (!due) return result

  if (config.autoArchiveCommentsEnabled) {
    const comments = await findEligibleCommentsForArchive(payload, config, now)
    for (const comment of comments.docs) {
      try {
        if (!dryRun) {
          await archiveComment({ payload, commentId: comment.id, reason: 'automated' })
        }
        result.commentsArchived++
      } catch (error) {
        errors.push({
          id: String(comment.id),
          operation: 'archive_comment',
          message: error instanceof Error ? error.message : 'Failed to archive comment',
        })
      }
    }
  }

  if (config.autoArchivePostsEnabled) {
    const posts = await findEligiblePostsForArchive(payload, config, now)
    for (const post of posts.docs as ReviewPost[]) {
      try {
        if (!dryRun) {
          await archivePost({
            payload,
            postId: post.id,
            reason: 'automated',
            retentionDays: config.postArchiveRetentionDays,
          })
        }
        result.postsArchived++
      } catch (error) {
        errors.push({
          id: String(post.id),
          operation: 'archive_post',
          message: error instanceof Error ? error.message : 'Failed to archive post',
        })
      }
    }
  }

  const expiredPosts = await findExpiredArchivedPosts(payload, config.postArchiveRetentionDays, now)
  for (const archive of expiredPosts.docs as ArchivedPostRecord[]) {
    try {
      if (!dryRun) await deleteArchivedPost({ payload, archiveId: archive.id })
      result.archivedPostsDeleted++
    } catch (error) {
      errors.push({
        id: String(archive.id),
        operation: 'delete_archived_post',
        message: error instanceof Error ? error.message : 'Failed to delete archived post',
      })
    }
  }

  const expiredComments = await findExpiredArchivedComments(payload, config.commentArchiveRetentionDays, now)
  for (const archive of expiredComments.docs as ArchivedCommentRecord[]) {
    try {
      if (!dryRun) await deleteArchivedComment({ payload, archiveId: archive.id })
      result.archivedCommentsDeleted++
    } catch (error) {
      errors.push({
        id: String(archive.id),
        operation: 'delete_archived_comment',
        message: error instanceof Error ? error.message : 'Failed to delete archived comment',
      })
    }
  }

  if (!dryRun) {
    await payload.updateGlobal({
      slug: 'archive-config',
      data: { lastRunAt: now.toISOString() },
      overrideAccess: true,
    })
  }
  return result
}

export function summarizeArchiveRun(result: ArchiveRunResult): string {
  const prefix = result.dryRun ? 'Archive maintenance dry run' : 'Archive maintenance completed'
  if (result.skipped) return `${prefix}: skipped until configured schedule is due`
  return `${prefix}: ${result.postsArchived} posts archived, ${result.commentsArchived} comments archived, ${result.archivedPostsDeleted} archived posts deleted, ${result.archivedCommentsDeleted} archived comments deleted, ${result.errors.length} errors`
}
