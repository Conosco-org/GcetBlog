# Architecture

This document describes the system architecture, design decisions, and folder structure of the GCET Blog platform.

## Overview

GCET Blog is a multi-tenant content management platform built with Next.js 15 and Payload CMS 3.x. It supports multiple institutions with isolated data, custom branding, and role-based access control.

## Tech Stack

### Core Technologies
- **Next.js 15**: React framework with App Router
- **Payload CMS 3.x**: Headless CMS for content management
- **MongoDB**: NoSQL database via Mongoose adapter
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling

### Key Libraries
- **Lexical**: Rich text editor
- **Radix UI**: Accessible component primitives
- **React Hook Form**: Form management
- **Cloudinary**: Media storage and optimization
- **SendGrid/Nodemailer**: Email delivery
- **Vercel Analytics**: Performance monitoring

## System Architecture

### Multi-Tenant Design

The platform supports multiple institutions through:
- **Institution-scoped data**: All content is associated with an institution
- **Custom branding**: Each institution has its own header/footer configuration
- **Isolated access**: Users can only access their institution's content

### Role-Based Access Control (RBAC)

Four primary roles with hierarchical permissions:

1. **Admin**: Full system access, user management, global settings
2. **Editor**: Content moderation, review queue, analytics
3. **Contributor**: Content creation, draft management
4. **User**: Public access, commenting, voting

### Content Workflow

```
Draft → Review → Feedback/Approve/Reject → Published/Deleted
  ↑        ↓           ↓
  └────────┴───────────┘
```

1. **Draft**: Contributor creates content with loading states preventing duplicate submissions
2. **Review**: Contributor submits for editor review (button shows "Submitting..." during action)
3. **Feedback**: Editor requests changes (returns to draft with editor feedback visible)
4. **Approve**: Editor approves content (button shows "Approving..." during action)
5. **Reject**: Editor rejects and deletes post (creates rejection notification)
6. **Published**: Content is live on the site

### Rejection Workflow

```
Review → Reject (with reason) → Notification Created → Post Deleted → Contributor Notified
```

- Editor clicks "Reject" button (shows "Rejecting..." during action)
- Editor provides rejection reason via prompt dialog
- System creates RejectionNotification before deletion
- Post is permanently deleted from database
- Contributor sees rejection notification in drafts page
- Contributor can dismiss notification (marks as read)
- All action buttons use loading states to prevent duplicate submissions

## Folder Structure

```
gcet-blog/
├── src/
│   ├── access/              # Access control policies
│   │   ├── adminOnly.ts
│   │   ├── authenticated.ts
│   │   └── ...
│   ├── app/                 # Next.js App Router
│   │   ├── (auth)/         # Authentication pages
│   │   ├── (frontend)/     # Public-facing pages
│   │   └── api/            # API routes
│   ├── collections/         # Payload collections
│   │   ├── Posts/
│   │   ├── Users/
│   │   ├── Media/
│   │   └── ...
│   ├── components/          # React components
│   │   ├── AdminUI/        # Admin panel components
│   │   ├── BeforeLogin/    # Login page components
│   │   └── ...
│   ├── fields/              # Reusable Payload fields
│   ├── Footer/              # Footer global config
│   ├── Header/              # Header global config
│   ├── hooks/               # Payload hooks
│   ├── jobs/                # Background jobs (newsletters)
│   ├── plugins/             # Payload plugins
│   ├── utilities/           # Helper functions
│   └── payload.config.ts    # Payload configuration
├── public/                  # Static assets
├── docs/                    # Documentation
├── .env                     # Environment variables
├── next.config.js           # Next.js configuration
├── tailwind.config.ts       # Tailwind configuration
└── package.json             # Dependencies
```

## Key Collections

### Posts
- Content articles with rich text editor
- Review status tracking (draft, pending_review, approved, rejected)
- Multi-tenant scoping
- SEO metadata
- Editor feedback field for requested changes
- Loading states on all action buttons (Submit for Review, Save Draft, Publish)
- Duplicate submission prevention through button disable logic

### Users
- Role-based permissions
- Institution association
- Profile management

### Media
- Cloudinary integration
- Image optimization
- Alt text for accessibility

### Categories
- Hierarchical organization
- Institution-scoped

### Comments
- Nested threading
- Moderation support
- User engagement

### Feedback
- Editor-to-contributor communication
- Review workflow support

### RejectionNotifications
- Stores rejection reasons for deleted posts
- Dismissible by contributors (marks as read)
- Tracks deleted posts with originalPostId
- Fields: postTitle, contributor, rejectedBy, reason, originalPostId, isRead, createdAt
- Access control: contributors see their own, editors see all
- Displayed in contributor drafts page with red/destructive styling

### Templates
- Reusable content structures
- Editor-created
- Institution-scoped

### Newsletter System
- **NewsletterSubscribers**: Email list management
- **Newsletters**: Campaign creation
- **NewsletterEvents**: Tracking (opens, clicks)

## Data Flow

### Content Creation
```
Contributor → Draft → Submit → Review Queue → Editor
```

### Content Publishing
```
Editor → Approve → Published → Frontend Display
```

### Media Upload
```
User → Upload → Cloudinary → URL → Database
```

### Newsletter Delivery
```
Cron Job → Query Subscribers → Render Email → SendGrid → Delivery
```

## Background Jobs

Scheduled tasks using Payload's job system:

- **Daily Digest**: 6:00 AM daily
- **Weekly Digest**: 7:00 AM Mondays
- **Monthly Digest**: 8:00 AM 1st of month
- **Scheduled Send**: Every 15 minutes
- **Stats Rollup**: Every 6 hours

## Security

### Authentication
- JWT-based sessions
- Secure password hashing
- Optional Google OAuth

### Authorization
- Collection-level access control
- Field-level permissions
- Operation-specific rules

### Data Isolation
- Institution-scoped queries
- User-owned content checks
- Admin-only operations

## Performance

### Optimization Strategies
- Static page generation where possible
- Image optimization via Cloudinary
- Database indexing on frequently queried fields
- Vercel Edge Network for global delivery

### Caching
- Next.js automatic caching
- Cloudinary CDN for media
- MongoDB query optimization

## Deployment

### Vercel Platform
- Automatic deployments from Git
- Environment variable management
- Serverless functions for API routes
- Edge network for global performance

### Database
- MongoDB Atlas for production
- Automatic backups
- Connection pooling

## Design Decisions

### Why Next.js App Router?
- Server components for better performance
- Simplified data fetching
- Built-in routing and layouts

### Why Payload CMS?
- TypeScript-first
- Flexible access control
- Rich text editing with Lexical
- Self-hosted control

### Why MongoDB?
- Flexible schema for multi-tenant data
- Good performance for content-heavy apps
- Easy scaling with Atlas

### Why Cloudinary?
- Automatic image optimization
- CDN delivery
- Transformation API

## Future Considerations

- **Search**: Full-text search with Payload plugin
- **Analytics**: Enhanced tracking and reporting
- **Mobile App**: API-first design enables mobile clients
- **Internationalization**: Multi-language support
- **Advanced Workflows**: Custom approval chains

## UI/UX Features

### Loading States & Duplicate Prevention
- All action buttons implement loading states to prevent duplicate submissions
- Button text changes during actions ("Submitting...", "Saving...", "Approving...", etc.)
- All buttons in a group disable when any action is in progress
- Loading states clear on error to allow retry
- Loading states persist on success until page refresh
- Immediate visual feedback (within 50ms of button click)

### Contributor Drafts Organization
- **Rejected Posts Section**: Red/destructive styling, shows rejection notifications
- **Requesting Changes Section**: Orange/warning styling, shows editor feedback
- **Current Drafts Section**: Neutral styling, regular drafts
- Each section has clear visual hierarchy and color coding

### Editor Review Queue
- Approve, Request Changes, and Reject buttons with loading states
- Confirmation dialogs for destructive actions (reject)
- All buttons disable during any action to prevent conflicts
- Toast notifications for success and error feedback

---

**Last Updated**: 2026-04-05  
**Maintained By**: GCET Development Team
