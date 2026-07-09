import type { GlobalConfig } from 'payload'

import { isAdmin } from '@backend/access/is-admin'

const scheduleOptions = [
  { label: 'Hourly', value: 'hourly' },
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
]

const validateRetentionDays = (value: unknown) => {
  const days = Number(value)
  if (!Number.isInteger(days) || days < 1 || days > 3650) {
    return 'Retention must be an integer between 1 and 3650 days'
  }
  return true
}

export const ArchiveConfig: GlobalConfig = {
  slug: 'archive-config',
  access: {
    read: isAdmin,
    update: isAdmin,
  },
  admin: {
    group: 'Editorial',
  },
  fields: [
    {
      name: 'postQueueRetentionDays',
      type: 'number',
      required: true,
      defaultValue: 90,
      min: 1,
      max: 3650,
      validate: validateRetentionDays,
      admin: {
        description: 'Pending-review age after which posts are archived.',
      },
    },
    {
      name: 'postArchiveRetentionDays',
      type: 'number',
      required: true,
      defaultValue: 30,
      min: 1,
      max: 3650,
      validate: validateRetentionDays,
      admin: {
        description: 'Days archived posts remain restorable.',
      },
    },
    {
      name: 'commentQueueRetentionDays',
      type: 'number',
      required: true,
      defaultValue: 30,
      min: 1,
      max: 3650,
      validate: validateRetentionDays,
      admin: {
        description: 'Pending age after which comments are archived.',
      },
    },
    {
      name: 'commentArchiveRetentionDays',
      type: 'number',
      required: true,
      defaultValue: 15,
      min: 1,
      max: 3650,
      validate: validateRetentionDays,
      admin: {
        description: 'Days archived comments remain restorable.',
      },
    },
    {
      name: 'autoArchivePostsEnabled',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Automatically archive stale pending posts.',
      },
    },
    {
      name: 'autoArchiveCommentsEnabled',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Automatically archive stale pending comments.',
      },
    },
    {
      name: 'jobSchedule',
      type: 'select',
      required: true,
      defaultValue: 'daily',
      options: scheduleOptions,
      admin: {
        description: 'How often the hourly archive task should perform real maintenance.',
      },
    },
    {
      name: 'dryRunEnabled',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'When enabled, the scheduled job reports candidates without changing records.',
      },
    },
    {
      name: 'lastRunAt',
      type: 'date',
      admin: {
        readOnly: true,
        description: 'Last time archive maintenance performed a scheduled run.',
      },
    },
  ],
}
