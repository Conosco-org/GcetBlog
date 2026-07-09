export const DEFAULT_POST_QUEUE_RETENTION_DAYS = 90
export const DEFAULT_POST_ARCHIVE_RETENTION_DAYS = 30
export const DEFAULT_COMMENT_QUEUE_RETENTION_DAYS = 30
export const DEFAULT_COMMENT_ARCHIVE_RETENTION_DAYS = 15

export const getArchiveStatusMessage = (retentionDays: number) =>
  `Archived: Your post has been moved to the archive because it remained idle in the review queue beyond the allowed review period. It will be retained for ${retentionDays} days for editorial review.`

export const getDeleteStatusMessage = (retentionDays: number) =>
  `Removed: Your archived post has been removed after the ${retentionDays}-day archive retention period. Thank you for your contribution.`

export const RESTORE_STATUS_MESSAGE =
  'Restored: Your post has been returned to the review queue for editorial review.'

export const ARCHIVE_STATUS_MESSAGE = getArchiveStatusMessage(DEFAULT_POST_ARCHIVE_RETENTION_DAYS)
export const DELETE_STATUS_MESSAGE = getDeleteStatusMessage(DEFAULT_POST_ARCHIVE_RETENTION_DAYS)

export const ARCHIVE_SCHEDULE_HOURS = {
  hourly: 1,
  daily: 24,
  weekly: 24 * 7,
  monthly: 24 * 30,
} as const

export type ArchiveSchedule = keyof typeof ARCHIVE_SCHEDULE_HOURS
