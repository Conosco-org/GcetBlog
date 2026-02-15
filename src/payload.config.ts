// storage-adapter-import-placeholder
import { mongooseAdapter } from '@payloadcms/db-mongodb'

import sharp from 'sharp' // sharp-import
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Users } from './collections/Users'
import { Votes } from './collections/Votes'
import { PageViews } from './collections/PageViews'
import { AdminLogs } from './collections/AdminLogs'
import { Comments } from './collections/Comments'
import { Feedback } from './collections/Feedback'
import { NewsletterSubscribers } from './collections/NewsletterSubscribers'
import { Newsletters } from './collections/Newsletters'
import { NewsletterEvents } from './collections/NewsletterEvents'
import {
  newsletterDailyDigest,
  newsletterWeeklyDigest,
  newsletterMonthlyDigest,
  newsletterScheduledSend,
  newsletterStatsRollup,
} from './jobs/newsletter'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'

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
    },
    components: {
      // Custom branding and navigation
      graphics: {
        Logo: '@/components/AdminUI/CustomLogo',
      },
      // Removed custom Nav - using Payload's default with admin.hidden
      
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      beforeLogin: ['@/components/BeforeLogin'],
      
      // Custom logout button
      logout: {
        Button: '@/components/AdminLogout'
      },
      
      // Add custom dashboard before the default one (so we can hide default with CSS)
      beforeDashboard: ['@/components/AdminUI/CustomDashboard'],
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
    NewsletterSubscribers,
    Newsletters,
    NewsletterEvents,
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
    outputFile: path.resolve(dirname, 'payload-types.ts'),
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
        handler: newsletterDailyDigest as any,
        schedule: [{ cron: '0 6 * * *', queue: 'default' }], // Every day at 6:00 AM
      },
      {
        slug: 'newsletter-weekly-digest',
        handler: newsletterWeeklyDigest as any,
        schedule: [{ cron: '0 7 * * 1', queue: 'default' }], // Every Monday at 7:00 AM
      },
      {
        slug: 'newsletter-monthly-digest',
        handler: newsletterMonthlyDigest as any,
        schedule: [{ cron: '0 8 1 * *', queue: 'default' }], // 1st of every month at 8:00 AM
      },
      {
        slug: 'newsletter-scheduled-send',
        handler: newsletterScheduledSend as any,
        schedule: [{ cron: '*/15 * * * *', queue: 'default' }], // Every 15 minutes
      },
      {
        slug: 'newsletter-stats-rollup',
        handler: newsletterStatsRollup as any,
        schedule: [{ cron: '0 */6 * * *', queue: 'default' }], // Every 6 hours
      },
    ],
  },
})
