import type { GlobalConfig } from 'payload'

import { isAdmin } from '@backend/access/is-admin'

const thresholdOptions = [
  { label: '15 Days', value: '15-days' },
  { label: '30 Days (1 month)', value: '30-days' },
  { label: '60 Days (2 months)', value: '60-days' },
  { label: '90 Days (3 months)', value: '90-days' },
]

const scheduleOptions = [
  { label: 'Hourly', value: 'hourly' },
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
]

export const LifecycleConfig: GlobalConfig = {
  slug: 'lifecycle-config',
  access: {
    read: isAdmin,
    update: isAdmin,
  },
  admin: {
    group: 'Editorial',
  },
  fields: [
    {
      name: 'commentDeletionThreshold',
      type: 'number',
      required: true,
      defaultValue: 60,
      min: 1,
      max: 3650,
      admin: {
        description: 'Age in days after which comments are deleted by lifecycle maintenance.',
      },
      validate: (value: unknown) => {
        const threshold = Number(value)
        if (!Number.isInteger(threshold)) return 'Comment deletion threshold must be an integer'
        if (threshold < 1 || threshold > 3650) {
          return 'Comment deletion threshold must be between 1 and 3650 days'
        }
        return true
      },
    },
    {
      name: 'postArchiveThreshold',
      type: 'select',
      required: true,
      defaultValue: '60-days',
      options: thresholdOptions,
      admin: {
        description: 'Age after which pending contributor posts are moved out of the review queue.',
      },
    },
    {
      name: 'autoArchiveEnabled',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Enable automatic post archiving during lifecycle maintenance.',
      },
    },
    {
      name: 'jobSchedule',
      type: 'select',
      required: true,
      defaultValue: 'daily',
      options: scheduleOptions,
      admin: {
        description: 'How often the hourly lifecycle task should perform real maintenance.',
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
        description: 'Last time lifecycle maintenance performed a scheduled run.',
      },
    },
  ],
}
