import {
  ARCHIVE_SCHEDULE_HOURS,
  type ArchiveSchedule,
} from './constants'

export function normalizeRetentionDays(value: unknown, fallback: number): number {
  const days = Number(value)
  return Number.isInteger(days) && days >= 1 && days <= 3650 ? days : fallback
}

export function getArchiveScheduleHours(value: string | null | undefined): number {
  return ARCHIVE_SCHEDULE_HOURS[(value || 'daily') as ArchiveSchedule] ?? 24
}

export function daysAgoCutoff(days: number, now = new Date()): string {
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString()
}

export function isArchivedItemRestorable(
  archivedAt: string | Date | null | undefined,
  retentionDays: number,
  now = new Date(),
): boolean {
  if (!archivedAt) return false
  const archivedTime = new Date(archivedAt).getTime()
  if (Number.isNaN(archivedTime)) return false
  return now.getTime() - archivedTime < retentionDays * 24 * 60 * 60 * 1000
}

export function isArchiveScheduleDue(
  lastRunAt: string | Date | null | undefined,
  schedule: string | null | undefined,
  now = new Date(),
): boolean {
  if (!lastRunAt) return true
  const lastRunTime = new Date(lastRunAt).getTime()
  if (Number.isNaN(lastRunTime)) return true

  const hours = getArchiveScheduleHours(schedule)
  return now.getTime() - lastRunTime >= hours * 60 * 60 * 1000
}
