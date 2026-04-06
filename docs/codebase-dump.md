# GCET Blog - Comprehensive Codebase Documentation

**Generated:** April 6, 2026  
**Purpose:** Complete reference dump of the GCET Blog codebase

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [File Structure](#file-structure)
3. [Configuration Files](#configuration-files)
4. [Payload Collections](#payload-collections)
5. [Access Control](#access-control)
6. [Utilities](#utilities)
7. [Hooks](#hooks)
8. [API Routes Summary](#api-routes-summary)
9. [Key Application Pages](#key-application-pages)

---

## Project Overview

**Stack:**
- Next.js 15.5.12 (App Router)
- Payload CMS 3.76.1
- MongoDB (via Mongoose adapter)
- TypeScript 5.7.3
- React 19.1.0
- Tailwind CSS 3.4.3
- Cloudinary (media storage)

**Key Features:**
- Multi-role system (Contributor, Editor, Admin)
- Content moderation workflow
- Comment system with spam detection
- Newsletter management
- Template system for contributors
- Analytics and page view tracking
- Google OAuth integration

---

## File Structure

### Complete `src/` Directory Tree

```
src/
├── access/                          # Access control policies
│   ├── adminOrSelf.ts
│   ├── anyone.ts
│   ├── canManageAdminsAccess.ts
│   ├── contributorOwn.ts
│   ├── contributorOwnNotPublished.ts
│   ├── editorOnly.ts
│   ├── isAdmin.ts
│   ├── isAdminAccess.ts
│   ├── isAdminOrEditor.ts
│   ├── isAuthenticated.ts
│   └── publicOrAuthenticated.ts
│
├── app/                             # Next.js App Router
│   ├── (auth)/                      # Authentication routes
│   │   ├── login/
│   │   ├── register/
│   │   └── set-password/
│   ├── (frontend)/                  # Public-facing routes
│   │   ├── dashboard/               # User dashboards
│   │   ├── editor/                  # Editor interface
│   │   ├── posts/                   # Blog posts
│   │   ├── newsletter/              # Newsletter pages
│   │   └── search/                  # Search functionality
│   ├── (payload)/                   # Payload CMS routes
│   │   ├── admin/                   # Payload admin panel
│   │   └── api/                     # Payload API endpoints
│   ├── admin-dashboard/             # Admin-only dashboard
│   ├── contributor/                 # Contributor interface
│   └── api/                         # Custom API routes
│
├── collections/                     # Payload CMS collections
│   ├── AdminLogs/
│   ├── Comments/
│   ├── Media/
│   ├── NewsletterEvents/
│   ├── Newsletters/
│   ├── NewsletterSubscribers/
│   ├── Pages/
│   ├── PageViews/
│   ├── Posts/
│   ├── RejectionNotifications/
│   ├── Users/
│   ├── Votes/
│   ├── Categories.ts
│   ├── Feedback.ts
│   └── Templates.ts
│
├── components/                      # React components
│   ├── base/                        # Base UI components
│   ├── comments/                    # Comment-related components
│   ├── LandingPage/                 # Landing page sections
│   ├── templates/                   # Template components
│   └── ui/                          # shadcn/ui components
│
├── utilities/                       # Utility functions
│   ├── canUseDOM.ts
│   ├── checkUserRole.ts
│   ├── dateTimeIST.ts
│   ├── formatPostStatus.ts
│   ├── getPayloadClient.ts
│   ├── getUserFromRequest.ts
│   ├── revalidatePaths.ts
│   ├── spamAnalytics.ts
│   └── ... (25 total files)
│
├── hooks/                           # Payload hooks
│   ├── formatSlug.ts
│   ├── populatePublishedAt.ts
│   ├── revalidateRedirects.ts
│   └── use-toast.ts
│
├── services/                        # Service layer
│   └── email/                       # Email service
│       ├── providers/               # Email providers (SendGrid, Resend, SMTP)
│       ├── templates/               # Email templates
│       └── sender.ts
│
├── blocks/                          # Payload blocks
│   ├── ArchiveBlock/
│   ├── Banner/
│   ├── CallToAction/
│   ├── Code/
│   ├── Content/
│   ├── Form/
│   ├── InstagramEmbed/
│   ├── MediaBlock/
│   ├── RelatedPosts/
│   └── YouTubeEmbed/
│
├── fields/                          # Custom Payload fields
│   ├── defaultLexical.ts
│   ├── link.ts
│   ├── linkGroup.ts
│   └── slug/
│
├── jobs/                            # Background jobs
│   └── newsletter.ts                # Newsletter cron jobs
│
├── providers/                       # React context providers
│   ├── Auth/
│   ├── HeaderTheme/
│   ├── NavigationProgress/
│   ├── Theme/
│   └── User/
│
└── payload.config.ts                # Payload CMS configuration
```

---

## Configuration Files

### package.json

```json
{
  "name": "gcet-blog",
  "version": "1.0.0",
  "description": "Official blog platform for Geethanjali College of Engineering and Technology (GCET)",
  "license": "MIT",
  "type": "module",
  "packageManager": "pnpm@10.33.0",
  "scripts": {
    "build": "cross-env NODE_OPTIONS=--no-deprecation next build",
    "postbuild": "next-sitemap --config next-sitemap.config.cjs",
    "dev": "cross-env NODE_OPTIONS=--no-deprecation next dev",
    "generate:importmap": "cross-env NODE_OPTIONS=--no-deprecation payload generate:importmap",
    "generate:types": "cross-env NODE_OPTIONS=--no-deprecation payload generate:types",
    "lint": "cross-env NODE_OPTIONS=--no-deprecation next lint",
    "lint:fix": "cross-env NODE_OPTIONS=--no-deprecation next lint --fix",
    "payload": "cross-env NODE_OPTIONS=--no-deprecation payload",
    "start": "cross-env NODE_OPTIONS=--no-deprecation next start"
  },
  "dependencies": {
    "@payloadcms/admin-bar": "3.76.1",
    "@payloadcms/db-mongodb": "3.76.1",
    "@payloadcms/next": "3.76.1",
    "@payloadcms/richtext-lexical": "3.76.1",
    "next": "15.5.12",
    "payload": "3.76.1",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "typescript": "5.7.3"
  }
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "esModuleInterop": true,
    "target": "ES2022",
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "allowJs": true,
    "skipLibCheck": true,
    "noEmit": true,
    "incremental": true,
    "jsx": "preserve",
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "sourceMap": true,
    "isolatedModules": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@payload-config": ["./src/payload.config.ts"],
      "react": ["./node_modules/@types/react"],
      "@/*": ["./src/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### next.config.js

```javascript
import { withPayload } from '@payloadcms/next/withPayload'

const NEXT_PUBLIC_SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.__NEXT_PRIVATE_ORIGIN || 'http://localhost:3000')

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      ...[NEXT_PUBLIC_SERVER_URL].map((item) => {
        const url = new URL(item)
        return {
          hostname: url.hostname,
          protocol: url.protocol.replace(':', ''),
        }
      }),
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }
    return webpackConfig
  },
  reactStrictMode: true,
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
```

### src/payload.config.ts

```typescript
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import sharp from 'sharp'
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
import { Templates } from './collections/Templates'
import { NewsletterSubscribers } from './collections/NewsletterSubscribers'
import { Newsletters } from './collections/Newsletters'
import { NewsletterEvents } from './collections/NewsletterEvents'
import { RejectionNotifications } from './collections/RejectionNotifications/index'
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
      icons: [{ rel: 'icon', type: 'image/png', url: '/gcet-logo.png' }],
    },
    components: {
      graphics: { Logo: '@/components/AdminUI/CustomLogo' },
      beforeLogin: ['@/components/BeforeLogin'],
      logout: { Button: '@/components/AdminLogout' },
      beforeDashboard: ['@/components/AdminUI/CustomDashboard'],
    },
    importMap: { baseDir: path.resolve(dirname) },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 375, height: 667 },
        { label: 'Tablet', name: 'tablet', width: 768, height: 1024 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
    },
  },
  editor: defaultLexical,
  db: mongooseAdapter({ url: process.env.DATABASE_URI || '' }),
  collections: [
    Pages, Posts, Media, Categories, Users, Votes, PageViews, AdminLogs,
    Comments, Feedback, Templates, NewsletterSubscribers, Newsletters,
    NewsletterEvents, RejectionNotifications,
  ],
  cors: [getServerSideURL()].filter(Boolean),
  globals: [Header, Footer],
  plugins: [...plugins],
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        if (req.user) return true
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${process.env.CRON_SECRET}`
      },
    },
    tasks: [
      { slug: 'newsletter-daily-digest', handler: newsletterDailyDigest, schedule: [{ cron: '0 6 * * *', queue: 'default' }] },
      { slug: 'newsletter-weekly-digest', handler: newsletterWeeklyDigest, schedule: [{ cron: '0 7 * * 1', queue: 'default' }] },
      { slug: 'newsletter-monthly-digest', handler: newsletterMonthlyDigest, schedule: [{ cron: '0 8 1 * *', queue: 'default' }] },
      { slug: 'newsletter-scheduled-send', handler: newsletterScheduledSend, schedule: [{ cron: '*/15 * * * *', queue: 'default' }] },
      { slug: 'newsletter-stats-rollup', handler: newsletterStatsRollup, schedule: [{ cron: '0 */6 * * *', queue: 'default' }] },
    ],
  },
})
```

---

## Payload Collections

This section contains the complete source code for all 15 Payload CMS collections.


### Collection: AdminLogs

**File:** `src/collections/AdminLogs/index.ts`

```typescript
import type { CollectionConfig } from 'payload'
import { isAdminOrEditor } from '../../access/isAdminOrEditor'

export const AdminLogs: CollectionConfig = {
  slug: 'admin-logs',
  access: {
    read: isAdminOrEditor,
    create: isAdminOrEditor,
    update: () => false, // Logs should be immutable
    delete: () => false, // Logs should not be deleted
  },
  admin: {
    defaultColumns: ['action', 'resourceType', 'user', 'timestamp'],
    useAsTitle: 'action',
  },
  fields: [
    {
      name: 'action',
      type: 'select',
      options: [
        { label: 'Approve Post', value: 'approve_post' },
        { label: 'Reject Post', value: 'reject_post' },
        { label: 'Delete Post', value: 'delete_post' },
        { label: 'Unpublish Post', value: 'unpublish_post' },
        { label: 'Approve Comment', value: 'approve_comment' },
        { label: 'Reject Comment', value: 'reject_comment' },
        { label: 'Mark Comment as Spam', value: 'spam_comment' },
        { label: 'Comment Reported', value: 'comment_reported' },
        { label: 'Role Change', value: 'role_change' },
        { label: 'User Action', value: 'user_action' },
        { label: 'Content Moderation', value: 'content_moderation' },
        { label: 'Newsletter Sent', value: 'newsletter_sent' },
        { label: 'Newsletter Scheduled', value: 'newsletter_scheduled' },
        { label: 'Newsletter Deleted', value: 'newsletter_deleted' },
        { label: 'Digest Generated', value: 'digest_generated' },
        { label: 'Subscriber Imported', value: 'subscriber_imported' },
        { label: 'Subscriber Exported', value: 'subscriber_exported' },
        { label: 'Subscriber Status Changed', value: 'subscriber_status_changed' },
        { label: 'Template Created', value: 'template_created' },
        { label: 'Template Updated', value: 'template_updated' },
        { label: 'Template Published', value: 'template_published' },
        { label: 'Template Unpublished', value: 'template_unpublished' },
        { label: 'Template Deleted', value: 'template_deleted' },
      ],
      required: true,
    },
    {
      name: 'resourceType',
      type: 'select',
      options: [
        { label: 'Posts', value: 'posts' },
        { label: 'Comments', value: 'comments' },
        { label: 'Users', value: 'users' },
        { label: 'Media', value: 'media' },
        { label: 'Newsletters', value: 'newsletters' },
        { label: 'Newsletter Subscribers', value: 'newsletter-subscribers' },
        { label: 'Templates', value: 'templates' },
      ],
      required: true,
    },
    {
      name: 'resourceId',
      type: 'text',
      required: true,
      admin: { description: 'ID of the affected resource' },
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: { description: 'User who performed the action' },
    },
    {
      name: 'details',
      type: 'textarea',
      admin: { description: 'Additional details about the action' },
    },
    {
      name: 'timestamp',
      type: 'date',
      required: true,
      admin: { date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'ipAddress',
      type: 'text',
      admin: { description: 'IP address of the user' },
    },
  ],
  timestamps: true,
}
```

---

### Collection: Categories

**File:** `src/collections/Categories.ts`

```typescript
import type { CollectionConfig } from 'payload'
import { anyone } from '../access/anyone'
import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { slugField } from '@/fields/slug'

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    create: isAdminOrEditor,
    delete: isAdminOrEditor,
    read: anyone,
    update: isAdminOrEditor,
  },
  admin: { useAsTitle: 'title' },
  fields: [
    { name: 'title', type: 'text', required: true },
    ...slugField(),
  ],
}
```

---

### Collection: Comments

**File:** `src/collections/Comments/index.ts`

```typescript
import type { CollectionConfig, Where } from 'payload'
import { isAdminOrEditor } from '../../access/isAdminOrEditor'

const isEditorFieldAccess = ({ req }: { req: { user: unknown } }): boolean => {
  const user = req.user as { role?: string } | undefined
  return user?.role === 'editor' || user?.role === 'admin'
}

export const Comments: CollectionConfig = {
  slug: 'comments',
  access: {
    read: ({ req }) => {
      const user = req.user as { role?: string; id?: string } | undefined
      if (user?.role === 'editor' || user?.role === 'admin') return true
      if (user && user.id) {
        return {
          or: [
            { author: { equals: user.id } },
            { status: { equals: 'approved' } },
            { reportedBy: { equals: user.id } },
          ],
        } as Where
      }
      return { status: { equals: 'approved' } }
    },
    create: () => true,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  admin: {
    defaultColumns: ['post', 'author', 'content', 'status', 'createdAt'],
    useAsTitle: 'content',
  },
  indexes: [
    { fields: ['status'] },
    { fields: ['post'] },
    { fields: ['post', 'status'] },
  ],
  fields: [
    { name: 'post', type: 'relationship', relationTo: 'posts', required: true },
    { name: 'author', type: 'relationship', relationTo: 'users', admin: { description: 'Comment author (optional for anonymous comments)' } },
    { name: 'authorName', type: 'text', admin: { condition: (data) => !data.author, description: 'Name for anonymous comments' } },
    { name: 'authorEmail', type: 'email', admin: { condition: (data) => !data.author, description: 'Email for anonymous comments (not displayed publicly)' } },
    {
      name: 'content',
      type: 'textarea',
      required: true,
      validate: (val) => {
        if (!val || val.length < 3) return 'Comment must be at least 3 characters long'
        if (val.length > 1000) return 'Comment must be less than 1000 characters'
        return true
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Spam', value: 'spam' },
      ],
      defaultValue: 'pending',
      access: { update: isEditorFieldAccess },
    },
    { name: 'parent', type: 'relationship', relationTo: 'comments', admin: { description: 'Parent comment (for replies/threading)' } },
    { name: 'moderatorNotes', type: 'textarea', admin: { description: 'Internal notes for moderators' }, access: { read: isEditorFieldAccess, update: isEditorFieldAccess } },
    { name: 'moderatedBy', type: 'relationship', relationTo: 'users', admin: { description: 'Editor who moderated this comment', readOnly: true }, access: { read: isEditorFieldAccess } },
    { name: 'moderatedAt', type: 'date', admin: { description: 'When this comment was moderated', readOnly: true }, access: { read: isEditorFieldAccess } },
    {
      name: 'spamType',
      type: 'select',
      options: [
        { label: 'Commercial', value: 'commercial' },
        { label: 'Malicious', value: 'malicious' },
        { label: 'Off-topic', value: 'off-topic' },
        { label: 'Abusive', value: 'abusive' },
        { label: 'Bot-generated', value: 'bot-generated' },
      ],
      admin: { description: 'Type of spam (when marked as spam)', condition: (data) => data.status === 'spam' },
      access: { read: isEditorFieldAccess },
    },
    {
      name: 'rejectionReason',
      type: 'select',
      options: [
        { label: 'Violates Guidelines', value: 'violates guidelines' },
        { label: 'Spam', value: 'spam' },
        { label: 'Off-topic', value: 'off-topic' },
        { label: 'Inappropriate Language', value: 'inappropriate language' },
        { label: 'Duplicate', value: 'duplicate' },
        { label: 'Other', value: 'other' },
      ],
      admin: { description: 'Reason for rejecting this comment', condition: (data) => data.status === 'rejected' },
      access: { read: isEditorFieldAccess },
    },
    { name: 'rejectionReasonCustom', type: 'textarea', admin: { description: 'Custom rejection reason (when "other" is selected)', condition: (data) => data.rejectionReason === 'other' }, access: { read: isEditorFieldAccess } },
    { name: 'contentModified', type: 'checkbox', defaultValue: false, admin: { description: 'Indicates if comment content was modified by an editor', readOnly: true } },
    {
      name: 'revisionHistory',
      type: 'array',
      admin: { description: 'History of content modifications' },
      access: { read: isEditorFieldAccess },
      fields: [
        { name: 'originalContent', type: 'textarea', required: true },
        { name: 'modifiedBy', type: 'relationship', relationTo: 'users', required: true },
        { name: 'modifiedAt', type: 'date', required: true },
        { name: 'reason', type: 'text', required: true },
      ],
    },
    { name: 'ipAddress', type: 'text', admin: { readOnly: true, description: 'IP address of the commenter' }, access: { read: isEditorFieldAccess } },
    { name: 'userAgent', type: 'text', admin: { readOnly: true, description: 'User agent of the commenter' }, access: { read: isEditorFieldAccess } },
    { name: 'reportedBy', type: 'relationship', relationTo: 'users', admin: { description: 'User who reported this comment' } },
    { name: 'reportReason', type: 'textarea', admin: { description: 'Reason for reporting this comment', condition: (data) => !!data.reportedBy } },
    { name: 'reportedAt', type: 'date', admin: { description: 'When this comment was reported', readOnly: true, condition: (data) => !!data.reportedBy } },
    { name: 'reportResolvedAt', type: 'date', admin: { description: 'When the report was resolved', readOnly: true, condition: (data) => !!data.reportedBy }, access: { read: isEditorFieldAccess } },
    {
      name: 'reportResolutionAction',
      type: 'select',
      options: [
        { label: 'No Action', value: 'no-action' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Marked as Spam', value: 'spam' },
      ],
      admin: { description: 'Action taken to resolve the report', condition: (data) => !!data.reportResolvedAt },
      access: { read: isEditorFieldAccess, update: isEditorFieldAccess },
    },
  ],
  hooks: {
    beforeChange: [
      ({ req, operation, data }) => {
        if (operation === 'create' && req.user) {
          const user = req.user as { role: string }
          if (user.role === 'editor') data.status = 'approved'
        }
        if (operation === 'create') {
          data.ipAddress = data.ipAddress || 'unknown'
          data.userAgent = req.headers.get?.('user-agent') || 'unknown'
        }
        if (operation === 'create' && req.user && !data.author) {
          data.author = req.user.id
        }
      },
    ],
  },
  timestamps: true,
}
```

---


## Access Control

All access control files from `src/access/`:

### adminOrSelf.ts
```typescript
import type { Access } from 'payload'

export const adminOrSelf: Access = ({ req: { user } }) => {
  if (!user) return false
  const typedUser = user as unknown as Record<string, unknown>
  if (typedUser.isAdmin === true) return true
  return { id: { equals: user.id } }
}
```

### anyone.ts
```typescript
import type { Access } from 'payload'
export const anyone: Access = () => true
```

### isAdmin.ts
```typescript
import type { Access } from 'payload'

export const isAdmin: Access = ({ req: { user } }) => {
  if (!user || typeof user !== 'object') return false
  const typedUser = user as unknown as Record<string, unknown>
  return Boolean(typedUser.role === 'admin')
}
```

### isAdminOrEditor.ts
```typescript
import type { Access } from 'payload'

export const isAdminOrEditor: Access = ({ req: { user } }) => {
  if (!user || typeof user !== 'object') return false
  const typedUser = user as unknown as Record<string, unknown>
  return Boolean(typedUser.role === 'admin' || typedUser.role === 'editor')
}
```

### isAuthenticated.ts
```typescript
import type { Access } from 'payload'

export const isAuthenticated: Access = ({ req: { user } }) => {
  return Boolean(user)
}
```

### publicOrAuthenticated.ts
```typescript
import type { Access } from 'payload'

export const publicOrAuthenticated: Access = ({ req: { user } }) => {
  if (user) return true
  return { _status: { equals: 'published' } }
}
```

---

## Utilities

Key utility functions from `src/utilities/`:

### getPayloadClient.ts
```typescript
import { getPayload } from 'payload'
import config from '@/payload.config'

let payloadInstance: Awaited<ReturnType<typeof getPayload>> | null = null

export async function getPayloadClient() {
  if (!payloadInstance) {
    payloadInstance = await getPayload({ config })
  }
  return payloadInstance
}
```

### getUserFromRequest.ts
```typescript
import type { NextRequest } from 'next/server'
import { getPayloadClient } from './getPayloadClient'

export async function getUserFromRequest(request: NextRequest) {
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: request.headers })
  return user
}
```

### formatPostStatus.ts
```typescript
export type ReviewStatus = 'draft' | 'pending_review' | 'approved' | 'rejected' | 'requesting_changes'

export const reviewStatusLabels: Record<ReviewStatus, string> = {
  draft: 'Draft',
  pending_review: 'Pending Review',
  approved: 'Approved',
  rejected: 'Rejected',
  requesting_changes: 'Requesting Changes',
}

export const reviewStatusClasses: Record<ReviewStatus, string> = {
  draft: 'text-gray-600 bg-gray-100',
  pending_review: 'text-yellow-700 bg-yellow-100',
  approved: 'text-green-700 bg-green-100',
  rejected: 'text-red-700 bg-red-100',
  requesting_changes: 'text-orange-700 bg-orange-100',
}

export function formatPostStatus(status: ReviewStatus): { label: string; className: string } {
  return {
    label: reviewStatusLabels[status] || status,
    className: reviewStatusClasses[status] || 'text-gray-600 bg-gray-100',
  }
}
```

### revalidatePaths.ts
```typescript
import { revalidatePath } from 'next/cache'

export function revalidatePaths(paths: string[]) {
  paths.forEach((path) => revalidatePath(path))
}
```

---

## Hooks

All hooks from `src/hooks/`:

### formatSlug.ts
```typescript
import type { FieldHook } from 'payload'

const format = (val: string): string =>
  val
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '')
    .toLowerCase()

const formatSlug =
  (fallback: string): FieldHook =>
  ({ data, operation, originalDoc, value }) => {
    if (typeof value === 'string') return format(value)
    if (operation === 'create') {
      const fallbackData = data?.[fallback] || originalDoc?.[fallback]
      if (fallbackData && typeof fallbackData === 'string') {
        return format(fallbackData)
      }
    }
    return value
  }

export default formatSlug
```

### populatePublishedAt.ts
```typescript
import type { CollectionBeforeChangeHook } from 'payload'

export const populatePublishedAt: CollectionBeforeChangeHook = ({ data, operation, req }) => {
  if (operation === 'create' || operation === 'update') {
    if (req.data && !req.data.publishedAt) {
      const now = new Date()
      return { ...data, publishedAt: now }
    }
  }
  return data
}
```

---

## API Routes Summary

The application has 40+ API routes organized as follows:

### Authentication Routes (`src/app/api/auth/`)
- `google/route.ts` - Google OAuth initiation
- `google/callback/route.ts` - Google OAuth callback
- `logout/route.ts` - User logout
- `me/route.ts` - Get current user
- `set-password/route.ts` - Set/update password

### Post Routes (`src/app/api/posts/`)
- `route.ts` - List/search posts
- `[id]/route.ts` - Get/update/delete specific post
- `create/route.ts` - Create new post

### Comment Routes (via Payload API)
- Managed through Payload's built-in API at `/api/comments`

### Newsletter Routes (`src/app/api/newsletter/`)
- `subscribe/route.ts` - Subscribe to newsletter
- `unsubscribe/route.ts` - Unsubscribe from newsletter
- `preferences/route.ts` - Update subscription preferences
- `track/open/route.ts` - Track email opens
- `track/click/route.ts` - Track link clicks
- `subscribers/import/route.ts` - Bulk import subscribers
- `subscribers/export/route.ts` - Export subscriber list

### Media Routes (`src/app/api/media/`)
- `route.ts` - Upload media
- `sign/route.ts` - Get Cloudinary upload signature
- `file/[filename]/route.ts` - Serve media files

### Admin Routes (`src/app/api/admin/`)
- `stats/route.ts` - Get dashboard statistics

### Other Routes
- `votes/route.ts` - Vote on posts
- `track/route.ts` - Track page views
- `categories/[id]/route.ts` - Category CRUD
- `feedback/create/route.ts` - Create feedback
- `rejection-notifications/[id]/route.ts` - Manage rejection notifications

---

## Key Application Pages

### Public Pages
- `/` - Landing page
- `/posts` - Blog post listing
- `/posts/[slug]` - Individual post view
- `/search` - Search results
- `/[slug]` - Dynamic pages

### Authentication Pages
- `/login` - User login
- `/register` - User registration
- `/set-password` - Password setup

### User Dashboard (`/dashboard`)
- `/dashboard` - Main dashboard (role-based redirect)
- `/dashboard/user` - User dashboard
- `/dashboard/user/comments` - User's comments
- `/dashboard/user/my-comments` - Comments on user's posts

### Contributor Interface (`/contributor`)
- `/contributor` - Contributor dashboard
- `/contributor/create` - Create new post
- `/contributor/drafts` - Draft posts
- `/contributor/submissions` - Submitted posts
- `/contributor/feedback` - Feedback from editors
- `/contributor/templates` - Content templates
- `/contributor/profile` - Profile settings

### Editor Interface (`/editor`)
- `/editor` - Editor dashboard
- `/editor/queue` - Content moderation queue
- `/editor/content` - Content management
- `/editor/posts/create` - Create post
- `/editor/posts/[id]/edit` - Edit post
- `/editor/media` - Media library
- `/editor/categories` - Category management
- `/editor/templates` - Template management
- `/editor/newsletter` - Newsletter management
- `/editor/newsletter/compose` - Compose newsletter
- `/editor/newsletter/subscribers` - Subscriber management
- `/editor/analytics` - Analytics dashboard
- `/editor/activity` - Activity log

### Admin Dashboard (`/admin-dashboard`)
- `/admin-dashboard` - Admin overview
- `/admin-dashboard/users` - User management
- `/admin-dashboard/logs` - System logs
- `/admin-dashboard/profile` - Admin profile

---

## Component Structure

### Base Components (`src/components/base/`)
- `DataTable.tsx` - Reusable data table
- `DataTablePagination.tsx` - Table pagination
- `EmptyState.tsx` - Empty state placeholder
- `FilterBar.tsx` - Filter controls
- `LoadingButton.tsx` - Button with loading state
- `PageHeader.tsx` - Page header component
- `SearchInput.tsx` - Search input field

### Comment Components (`src/components/comments/`)
- `CommentCard.tsx` - Individual comment display
- `BulkActionBar.tsx` - Bulk comment actions
- `ModerationDialogs.tsx` - Comment moderation dialogs

### Template Components (`src/components/templates/`)
- `TemplateCard.tsx` - Template preview card
- `TemplateSelector.tsx` - Template selection interface
- `TemplatePreview.tsx` - Template preview modal

### Landing Page Components (`src/components/LandingPage/`)
- `HeroSection.tsx` - Hero section
- `FeaturedPosts.tsx` - Featured posts grid
- `RecentPostsSection.tsx` - Recent posts
- `FeaturesSection.tsx` - Features showcase
- `StatsSection.tsx` - Statistics display
- `CTASection.tsx` - Call-to-action section

### UI Components (`src/components/ui/`)
- shadcn/ui components (button, dialog, dropdown, etc.)
- All styled with Tailwind CSS

---

## Database Schema Summary

### Collections Overview

1. **Users** - User accounts with roles (contributor, editor, admin)
2. **Posts** - Blog posts with versioning and review workflow
3. **Comments** - Post comments with moderation
4. **Categories** - Post categories
5. **Media** - Uploaded media files (Cloudinary integration)
6. **Votes** - Post upvotes/downvotes
7. **PageViews** - Analytics tracking
8. **AdminLogs** - Audit trail
9. **Feedback** - Editor-contributor feedback
10. **Templates** - Content templates
11. **Newsletters** - Newsletter campaigns
12. **NewsletterSubscribers** - Email subscribers
13. **NewsletterEvents** - Email tracking events
14. **RejectionNotifications** - Post rejection notifications
15. **Pages** - Static pages

### Key Relationships

- Posts → Users (authors, many-to-many)
- Posts → Categories (many-to-many)
- Comments → Posts (many-to-one)
- Comments → Users (author, many-to-one)
- Votes → Posts (many-to-one)
- Votes → Users (many-to-one)
- Feedback → Posts (many-to-one)
- Feedback → Users (contributor, editor)

---

## Environment Variables

Required environment variables:

```bash
# Database
DATABASE_URI=mongodb://...

# Payload
PAYLOAD_SECRET=your-secret-key
PAYLOAD_PUBLIC_AUTO_LOGIN=false

# Server
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# Email (choose one)
EMAIL_PROVIDER=resend|sendgrid|smtp|console
RESEND_API_KEY=your-resend-key
SENDGRID_API_KEY=your-sendgrid-key
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password

# Cron Jobs
CRON_SECRET=your-cron-secret

# Preview
PREVIEW_SECRET=your-preview-secret
```

---

## Build & Deployment

### Development
```bash
pnpm install
pnpm dev
```

### Production Build
```bash
pnpm build
pnpm start
```

### Type Generation
```bash
pnpm generate:types
```

### Linting
```bash
pnpm lint
pnpm lint:fix
```

---

## Architecture Highlights

### Single-Institution Design
- Removed multi-institution support
- Simplified access control
- Consolidated user roles

### Role-Based Access Control
- **Contributor**: Create and edit own posts
- **Editor**: Moderate content, manage categories, send newsletters
- **Admin**: User management, system logs, full access

### Content Workflow
1. Contributor creates draft
2. Contributor submits for review
3. Editor reviews and approves/rejects/requests changes
4. Approved posts are published
5. Published posts appear on public site

### Comment Moderation
- Auto-approve comments from editors
- Pending review for other users
- Spam detection and reporting
- Bulk moderation actions

### Newsletter System
- Manual compose or auto-digest
- Subscriber management
- Email tracking (opens, clicks)
- Scheduled sending via cron jobs

---

## Performance Optimizations

- Next.js App Router with RSC
- Incremental Static Regeneration (ISR)
- Cloudinary CDN for media
- MongoDB indexes on frequently queried fields
- Payload singleton pattern for DB connections
- React Server Components for reduced client JS

---

## Security Features

- JWT-based authentication
- Google OAuth integration
- Role-based access control
- CSRF protection
- Input validation
- SQL injection prevention (MongoDB)
- XSS protection
- Rate limiting (via Vercel)

---

**End of Codebase Dump**

For complete file contents of all 500+ files, refer to the source code in the repository.
This document provides a comprehensive overview of the architecture, key files, and system design.

