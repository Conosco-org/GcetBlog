export const ARCHIVE_STATUS_MESSAGE =
  'Archived: Your post has been moved to the archive because it remained idle in the review queue beyond the allowed review period. It will be retained for 30 days for editorial review.'

export const DELETE_STATUS_MESSAGE =
  'Removed: Your archived post has been removed after the 30-day archive retention period. Thank you for your contribution.'

export const RESTORE_STATUS_MESSAGE =
  'Restored: Your post has been returned to the review queue for editorial review.'

export const ARCHIVE_RETENTION_DAYS = 30

export const POST_ARCHIVE_THRESHOLD_DAYS = {
  '15-days': 15,
  '30-days': 30,
  '60-days': 60,
  '90-days': 90,
} as const

export const ARCHIVE_SCHEDULE_HOURS = {
  hourly: 1,
  daily: 24,
  weekly: 24 * 7,
  monthly: 24 * 30,
} as const

export type PostArchiveThreshold = keyof typeof POST_ARCHIVE_THRESHOLD_DAYS
export type ArchiveSchedule = keyof typeof ARCHIVE_SCHEDULE_HOURS
