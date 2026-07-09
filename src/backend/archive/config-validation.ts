const scheduleValues = ['hourly', 'daily', 'weekly', 'monthly'] as const
type JobSchedule = (typeof scheduleValues)[number]
const scheduleSet = new Set<string>(scheduleValues)

export function validateArchiveConfigBody(body: unknown) {
  const data = body as Record<string, unknown>
  const fields = [
    'postQueueRetentionDays',
    'postArchiveRetentionDays',
    'commentQueueRetentionDays',
    'commentArchiveRetentionDays',
  ] as const
  const values = Object.fromEntries(fields.map((field) => [field, Number(data[field])])) as Record<
    (typeof fields)[number],
    number
  >
  for (const field of fields) {
    if (!Number.isInteger(values[field]) || values[field] < 1 || values[field] > 3650) {
      return { error: `${field} must be an integer between 1 and 3650 days` }
    }
  }

  const jobSchedule = String(data.jobSchedule || '')
  if (!scheduleSet.has(jobSchedule)) {
    return { error: 'Job schedule must be one of: hourly, daily, weekly, monthly' }
  }

  return {
    data: {
      ...values,
      autoArchivePostsEnabled: Boolean(data.autoArchivePostsEnabled),
      autoArchiveCommentsEnabled: Boolean(data.autoArchiveCommentsEnabled),
      jobSchedule: jobSchedule as JobSchedule,
      dryRunEnabled: Boolean(data.dryRunEnabled),
    },
  }
}
