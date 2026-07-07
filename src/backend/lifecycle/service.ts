import type { Payload, Where } from 'payload'

import {
  ARCHIVE_RETENTION_DAYS,
  ARCHIVE_STATUS_MESSAGE,
  DELETE_STATUS_MESSAGE,
  RESTORE_STATUS_MESSAGE,
  type LifecycleNoticeType,
} from './constants'
import {
  daysAgoCutoff,
  getPostArchiveThresholdDays,
  isArchivedPostRestorable,
  isLifecycleScheduleDue,
} from './helpers'

interface LifecycleConfigShape {
  commentDeletionThreshold?: number | null
  postArchiveThreshold?: string | null
  autoArchiveEnabled?: boolean | null
  jobSchedule?: string | null
  dryRunEnabled?: boolean | null
  lastRunAt?: string | null
}

interface LifecycleUser {
  id?: string
}

interface LifecycleRunOptions {
  dryRun?: boolean
  force?: boolean
  now?: Date
}

interface LifecycleError {
  id: string
  operation: string
  message: string
}

interface LifecycleRunResult {
  commentsDeleted: number
  postsArchived: number
  archivesDeleted: number
  skipped: boolean
  dryRun: boolean
  errors: LifecycleError[]
}

type LifecyclePost = {
  id: string
  title?: string | null
  authors?: unknown
  archivedAt?: string | null
}

const activeLifecycleWhere: Where = {
  or: [
    { archivedStatus: { exists: false } },
    { archivedStatus: { equals: 'active' } },
  ],
}

export async function getLifecycleConfig(payload: Payload): Promise<LifecycleConfigShape> {
  try {
    return await payload.findGlobal({
      slug: 'lifecycle-config',
      depth: 0,
      overrideAccess: true,
    }) as LifecycleConfigShape
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

export function getContributorId(post: LifecyclePost): string | null {
  const authors = post.authors
  if (!Array.isArray(authors) || authors.length === 0) return null
  const firstAuthor = authors[0]
  if (typeof firstAuthor === 'string') return firstAuthor
  if (typeof firstAuthor === 'object' && firstAuthor && 'id' in firstAuthor) {
    return String((firstAuthor as { id: unknown }).id)
  }
  return null
}

export function getActiveLifecycleWhere(): Where {
  return activeLifecycleWhere
}

export async function findEligiblePostsForArchive(
  payload: Payload,
  config: LifecycleConfigShape,
  now = new Date(),
) {
  const thresholdDays = getPostArchiveThresholdDays(config.postArchiveThreshold)
  return payload.find({
    collection: 'posts',
    where: {
      and: [
        { _status: { equals: 'draft' } },
        { reviewStatus: { equals: 'pending_review' } },
        activeLifecycleWhere,
        { postAgeReferenceTimestamp: { less_than_equal: daysAgoCutoff(thresholdDays, now) } },
      ],
    },
    depth: 1,
    draft: true,
    limit: 1000,
    sort: 'postAgeReferenceTimestamp',
  })
}

export async function findEligibleArchivedPostsForDeletion(payload: Payload, now = new Date()) {
  return payload.find({
    collection: 'posts',
    where: {
      and: [
        { archivedStatus: { equals: 'archived' } },
        { archivedAt: { less_than_equal: daysAgoCutoff(ARCHIVE_RETENTION_DAYS, now) } },
      ],
    },
    depth: 1,
    draft: true,
    limit: 1000,
    sort: 'archivedAt',
  })
}

export async function createLifecycleNotice({
  payload,
  post,
  type,
  message,
  user,
}: {
  payload: Payload
  post: LifecyclePost
  type: LifecycleNoticeType
  message: string
  user?: LifecycleUser | null
}) {
  const contributor = getContributorId(post)
  if (!contributor) return null

  return payload.create({
    collection: 'lifecycle-notices',
    data: {
      post: post.id,
      postTitle: post.title || 'Untitled post',
      contributor,
      type,
      message,
      createdBy: user?.id,
      isRead: false,
    },
    overrideAccess: true,
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
  user?: LifecycleUser | null
  reason?: 'manual' | 'automated'
}) {
  const post = await payload.findByID({
    collection: 'posts',
    id: postId,
    depth: 1,
    draft: true,
  }) as LifecyclePost & { reviewStatus?: string; archivedStatus?: string; _status?: string }

  if (!post) throw new Error('Post not found')
  if (post._status !== 'draft' || post.reviewStatus !== 'pending_review') {
    throw new Error('Post not found in review queue')
  }
  if (post.archivedStatus && post.archivedStatus !== 'active') {
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
  const updatedPost = await payload.update({
    collection: 'posts',
    id: postId,
    data: {
      archivedStatus: 'archived',
      statusMessage: ARCHIVE_STATUS_MESSAGE,
      archivedAt,
      archivedBy: user?.id,
      archiveReason: reason,
    },
    draft: true,
    overrideAccess: true,
  })

  await createLifecycleNotice({
    payload,
    post,
    type: 'archived',
    message: ARCHIVE_STATUS_MESSAGE,
    user,
  })

  return updatedPost
}

export async function restoreArchivedPost({
  payload,
  postId,
  user,
}: {
  payload: Payload
  postId: string
  user?: LifecycleUser | null
}) {
  const post = await payload.findByID({
    collection: 'posts',
    id: postId,
    depth: 1,
    draft: true,
  }) as LifecyclePost & { archivedStatus?: string }

  if (!post) throw new Error('Post not found in archive')
  if (post.archivedStatus !== 'archived') throw new Error('Post not found in archive')
  if (!isArchivedPostRestorable(post.archivedAt)) {
    throw new Error('Post cannot be restored after 30 days')
  }

  const updatedPost = await payload.update({
    collection: 'posts',
    id: postId,
    data: {
      archivedStatus: 'active',
      statusMessage: RESTORE_STATUS_MESSAGE,
      postAgeReferenceTimestamp: new Date().toISOString(),
      archivedAt: null,
      archivedBy: null,
      archiveReason: null,
      lifecycleDeletedAt: null,
      lifecycleDeletedBy: null,
    },
    draft: true,
    overrideAccess: true,
  })

  await createLifecycleNotice({
    payload,
    post,
    type: 'restored',
    message: RESTORE_STATUS_MESSAGE,
    user,
  })

  return updatedPost
}

export async function softDeleteArchivedPost({
  payload,
  postId,
  user,
}: {
  payload: Payload
  postId: string
  user?: LifecycleUser | null
}) {
  const post = await payload.findByID({
    collection: 'posts',
    id: postId,
    depth: 1,
    draft: true,
  }) as LifecyclePost & { archivedStatus?: string }

  if (!post) throw new Error('Post not found in archive')
  if (post.archivedStatus !== 'archived') throw new Error('Post not found in archive')

  const updatedPost = await payload.update({
    collection: 'posts',
    id: postId,
    data: {
      archivedStatus: 'deleted',
      statusMessage: DELETE_STATUS_MESSAGE,
      lifecycleDeletedAt: new Date().toISOString(),
      lifecycleDeletedBy: user?.id,
    },
    draft: true,
    overrideAccess: true,
  })

  await createLifecycleNotice({
    payload,
    post,
    type: 'deleted',
    message: DELETE_STATUS_MESSAGE,
    user,
  })

  return updatedPost
}

export async function runLifecycleMaintenance(
  payload: Payload,
  options: LifecycleRunOptions = {},
): Promise<LifecycleRunResult> {
  const now = options.now || new Date()
  const config = await getLifecycleConfig(payload)
  const dryRun = options.dryRun ?? Boolean(config.dryRunEnabled)
  const due = options.force || isLifecycleScheduleDue(config.lastRunAt, config.jobSchedule, now)
  const errors: LifecycleError[] = []

  if (!due) {
    return {
      commentsDeleted: 0,
      postsArchived: 0,
      archivesDeleted: 0,
      skipped: true,
      dryRun,
      errors,
    }
  }

  const commentThreshold = config.commentDeletionThreshold || 60
  const oldComments = await payload.find({
    collection: 'comments',
    where: {
      createdAt: {
        less_than_equal: daysAgoCutoff(commentThreshold, now),
      },
    },
    depth: 0,
    limit: 1000,
    sort: 'createdAt',
  })

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
        operation: 'delete_comment',
        message: error instanceof Error ? error.message : 'Failed to delete comment',
      })
    }
  }

  let postsArchived = 0
  if (config.autoArchiveEnabled !== false) {
    const eligiblePosts = await findEligiblePostsForArchive(payload, config, now)
    for (const post of eligiblePosts.docs as LifecyclePost[]) {
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

  const expiredArchives = await findEligibleArchivedPostsForDeletion(payload, now)
  let archivesDeleted = 0
  for (const post of expiredArchives.docs as LifecyclePost[]) {
    try {
      if (!dryRun) {
        await softDeleteArchivedPost({
          payload,
          postId: post.id,
        })
      }
      archivesDeleted++
    } catch (error) {
      errors.push({
        id: String(post.id),
        operation: 'soft_delete_archive',
        message: error instanceof Error ? error.message : 'Failed to delete archived post',
      })
    }
  }

  if (!dryRun) {
    await payload.updateGlobal({
      slug: 'lifecycle-config',
      data: {
        lastRunAt: now.toISOString(),
      },
      overrideAccess: true,
    })
  }

  return {
    commentsDeleted,
    postsArchived,
    archivesDeleted,
    skipped: false,
    dryRun,
    errors,
  }
}

export function summarizeLifecycleRun(result: LifecycleRunResult): string {
  const prefix = result.dryRun ? 'Lifecycle maintenance dry run' : 'Lifecycle maintenance completed'
  if (result.skipped) return `${prefix}: skipped until configured schedule is due`

  return `${prefix}: ${result.commentsDeleted} comments deleted, ${result.postsArchived} posts archived, ${result.archivesDeleted} archives deleted, ${result.errors.length} errors`
}
