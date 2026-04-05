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
Draft → Review → Feedback/Approve → Published
  ↑        ↓           ↓
  └────────┴───────────┘
```

1. **Draft**: Contributor creates content
2. **Review**: Contributor submits for editor review
3. **Feedback**: Editor requests changes (returns to draft)
4. **Approve**: Editor approves content
5. **Published**: Content is live on the site

### Rejection Workflow

```
Review → Reject → Notification → Delete
```

- Editor rejects post with reason
- System creates rejection notification
- Post is permanently deleted
- Contributor sees rejection in drafts

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
- Review status tracking
- Multi-tenant scoping
- SEO metadata

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
- Stores rejection reasons
- Dismissible by contributors
- Tracks deleted posts

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

---

**Last Updated**: 2026-04-05  
**Maintained By**: GCET Development Team
