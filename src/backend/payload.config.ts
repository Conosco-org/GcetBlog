// storage-adapter-import-placeholder
import { mongooseAdapter } from '@payloadcms/db-mongodb'

import sharp from 'sharp' // sharp-import
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from './collections/content/categories'
import { Media } from './collections/content/media'
import { Pages } from './collections/content/pages'
import { Posts } from './collections/content/posts'
import { Comments } from './collections/content/comments'
import { Users } from './collections/users/users'
import { Notifications } from './collections/users/notifications'
import { Votes } from './collections/analytics/votes'
import { PageViews } from './collections/analytics/page-views'
import { AdminLogs } from './collections/analytics/admin-logs'
import { Newsletters } from './collections/newsletter/newsletters'
import { NewsletterSubscribers } from './collections/newsletter/subscribers'
import { NewsletterEvents } from './collections/newsletter/events'
import { Feedback } from './collections/editorial/feedback'
import { Templates } from './collections/editorial/templates'
import { RejectionNotifications } from './collections/editorial/rejection-notifications'
import {
  newsletterDailyDigest,
  newsletterWeeklyDigest,
  newsletterMonthlyDigest,
  newsletterScheduledSend,
  newsletterStatsRollup,
} from './jobs/newsletter'
import { Header } from './globals/header/config'
import { Footer } from './globals/footer/config'
import { plugins } from './plugins'
import { defaultLexical } from './fields/default-lexical'
import { getServerSideURL } from '@shared/lib/get-url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    autoLogin: process.env.PAYLOAD_PUBLIC_AUTO_LOGIN === 'true' ? {
      email: 'admin@gcet.edu.in',
      password: 'test',
      prefillOnly: true,
    } : false,
    meta: {
      title: 'GCET Blog Admin',
      titleSuffix: '- GCET Blog',
      icons: [
        {
          rel: 'icon',
          type: 'image/png',
          url: '/gcet-logo.png',
        },
      ],
    },
    components: {
      // Custom branding and navigation
      graphics: {
        Logo: '@frontend/components/admin-ui/custom-logo',
      },
      // Removed custom Nav - using Payload's default with admin.hidden
      
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      beforeLogin: ['@frontend/components/admin-ui/before-login'],
      
      // Custom logout button
      logout: {
        Button: '@frontend/components/admin-ui/admin-logout'
      },
      
      // Add custom dashboard before the default one (so we can hide default with CSS)
      beforeDashboard: ['@frontend/components/admin-ui/custom-dashboard'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),
  collections: [
    Pages,
    Posts,
    Media,
    Categories,
    Users,
    Votes,
    PageViews,
    AdminLogs,
    Comments,
    Feedback,
    Templates,
    NewsletterSubscribers,
    Newsletters,
    NewsletterEvents,
    RejectionNotifications,
    Notifications,
  ],
  cors: [getServerSideURL()].filter(Boolean),
  globals: [Header, Footer],
  plugins: [
    ...plugins,
    // storage-adapter-placeholder
  ],
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, '../shared/types/payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${process.env.CRON_SECRET}`
      },
    },
    tasks: [
      {
        slug: 'newsletter-daily-digest',
        handler: newsletterDailyDigest,
        schedule: [{ cron: '0 6 * * *', queue: 'default' }], // Every day at 6:00 AM
      },
      {
        slug: 'newsletter-weekly-digest',
        handler: newsletterWeeklyDigest,
        schedule: [{ cron: '0 7 * * 1', queue: 'default' }], // Every Monday at 7:00 AM
      },
      {
        slug: 'newsletter-monthly-digest',
        handler: newsletterMonthlyDigest,
        schedule: [{ cron: '0 8 1 * *', queue: 'default' }], // 1st of every month at 8:00 AM
      },
      {
        slug: 'newsletter-scheduled-send',
        handler: newsletterScheduledSend,
        schedule: [{ cron: '*/15 * * * *', queue: 'default' }], // Every 15 minutes
      },
      {
        slug: 'newsletter-stats-rollup',
        handler: newsletterStatsRollup,
        schedule: [{ cron: '0 */6 * * *', queue: 'default' }], // Every 6 hours
      },
    ],
  },
})
