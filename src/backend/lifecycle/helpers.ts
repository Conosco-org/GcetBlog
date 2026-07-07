import {
  ARCHIVE_RETENTION_DAYS,
  LIFECYCLE_SCHEDULE_HOURS,
  POST_ARCHIVE_THRESHOLD_DAYS,
  type LifecycleSchedule,
  type PostArchiveThreshold,
} from './constants'

export function getPostArchiveThresholdDays(value: string | null | undefined): number {
  return POST_ARCHIVE_THRESHOLD_DAYS[(value || '60-days') as PostArchiveThreshold] ?? 60
}

export function getLifecycleScheduleHours(value: string | null | undefined): number {
  return LIFECYCLE_SCHEDULE_HOURS[(value || 'daily') as LifecycleSchedule] ?? 24
}

export function daysAgoCutoff(days: number, now = new Date()): string {
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString()
}

export function isArchivedPostRestorable(archivedAt: string | Date | null | undefined, now = new Date()): boolean {
  if (!archivedAt) return false
  const archivedTime = new Date(archivedAt).getTime()
  if (Number.isNaN(archivedTime)) return false
  return now.getTime() - archivedTime < ARCHIVE_RETENTION_DAYS * 24 * 60 * 60 * 1000
}

export function isLifecycleScheduleDue(
  lastRunAt: string | Date | null | undefined,
  schedule: string | null | undefined,
  now = new Date(),
): boolean {
  if (!lastRunAt) return true
  const lastRunTime = new Date(lastRunAt).getTime()
  if (Number.isNaN(lastRunTime)) return true

  const hours = getLifecycleScheduleHours(schedule)
  return now.getTime() - lastRunTime >= hours * 60 * 60 * 1000
}
