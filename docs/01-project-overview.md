# Project Overview

## 🎯 What is GCET Blog?

GCET Blog is a modern, full-stack blog platform built for Geethanjali College of Engineering and Technology. It provides a content management system where multiple users with different roles can collaborate to create, review, and publish blog posts.

## 🏗️ Technology Stack

### Frontend
- **Next.js 15.4.4** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components
- **Lucide React** - Icon library

### Backend
- **Payload CMS 3.x** - Headless CMS
- **Node.js** - JavaScript runtime
- **MongoDB** - Database (configured via Payload)

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Vitest** - Unit testing
- **Playwright** - E2E testing
- **Docker** - Containerization

## 🎨 Key Features

### Current Features
1. **Multi-Role Authentication**
   - Contributor, Editor, and Admin roles
   - Secure cookie-based sessions
   - Role-based access control

2. **Content Management**
   - Rich text editor (Lexical)
   - Media uploads
   - Categories and tags
   - Post drafts and publishing

3. **User Dashboards**
   - `/dashboard` - Contributor dashboard
   - `/editor` - Editor dashboard
   - `/admin` - Admin panel (Payload CMS)

4. **Comment System**
   - Threaded comments on blog posts
   - User authentication required

5. **Search & Discovery**
   - Full-text search
   - Category filtering
   - Post archives

### Planned Features
1. **Account Management Pages**
   - `/dashboard/account` - Contributor profile settings
   - `/editor/account` - Editor profile and preferences
   - `/admin/account` - Admin profile and system settings

2. **Email Verification**
   - Email verification on registration
   - Password reset functionality

3. **Enhanced Analytics**
   - Post view tracking
   - User engagement metrics

## 🏛️ Architecture Highlights

### Route-Based Organization
The app uses Next.js route groups to separate concerns:
```
app/
├── (frontend)/     # Public blog pages
├── (auth)/         # Login/registration
└── (payload)/      # CMS admin panel
```

### Server-Side Rendering
- All pages are server-rendered by default
- Client components marked with `'use client'`
- Optimal performance and SEO

### Type Safety
- Full TypeScript coverage
- Auto-generated Payload types
- Runtime validation with Payload schemas

### Modern React Patterns
- Server Actions for mutations
- React Context for client state
- Suspense boundaries for loading states

## 👥 User Roles & Permissions

### Contributor
- Create and edit their own posts
- Upload media
- Submit posts for review
- Comment on published posts
- Access: `/dashboard`, `/dashboard/account` (planned)

### Editor
- All Contributor permissions
- Review and publish any post
- Edit any post
- Manage categories
- Access: `/editor`, `/editor/account` (planned)

### Admin
- All Editor permissions
- User management
- System configuration
- Access logs and analytics
- Access: `/admin`, `/admin/account` (planned)

## 🔐 Security Features

1. **Authentication**
   - HTTP-only cookies for session tokens
   - 7-day token expiration
   - Secure password hashing (handled by Payload)

2. **Authorization**
   - Middleware-based route protection
   - Role-based access control (RBAC)
   - Server-side permission checks

3. **Data Validation**
   - Server-side validation on all inputs
   - TypeScript type checking
   - Payload CMS schema validation

## 🎯 Design Principles

1. **Separation of Concerns**
   - Route groups isolate different app sections
   - Clear component hierarchy
   - Dedicated API routes

2. **Type Safety First**
   - TypeScript everywhere
   - Auto-generated types from Payload
   - Runtime validation

3. **Performance Optimized**
   - Server-side rendering
   - Image optimization
   - Code splitting
   - Edge caching

4. **Developer Experience**
   - Clear folder structure
   - Comprehensive documentation
   - Consistent code style
   - Hot module replacement

## 📊 Data Flow

```
User Request
    ↓
Middleware (Auth Check)
    ↓
Route Handler / Server Component
    ↓
Payload CMS (if data needed)
    ↓
MongoDB
    ↓
Response to User
```

### For Mutations:
```
User Action
    ↓
Server Action
    ↓
Validation
    ↓
Payload CMS API
    ↓
MongoDB Update
    ↓
Revalidation / Redirect
    ↓
Updated UI
```

## 🌐 Deployment

The application is designed to be deployed on:
- **Vercel** (recommended for Next.js)
- **Docker** (for self-hosting)
- Any Node.js hosting platform

Environment variables required:
- `PAYLOAD_SECRET` - Secret key for Payload CMS
- `DATABASE_URI` - MongoDB connection string
- `NEXT_PUBLIC_SERVER_URL` - Public URL of the app

## 📈 Scalability Considerations

1. **Database Indexing**
   - Indexes on frequently queried fields
   - Optimized for read-heavy workloads

2. **Caching Strategy**
   - Next.js cache for static content
   - ISR (Incremental Static Regeneration) for blog posts

3. **Media Handling**
   - Optimized image delivery
   - CDN integration ready
   - Lazy loading

4. **API Rate Limiting**
   - Protection against abuse
   - Configurable limits per role

## 🧩 Integration Points

The system integrates with:
- **MongoDB** - Primary database
- **Email Service** (planned) - For notifications
- **Analytics** (optional) - Google Analytics / custom
- **CDN** (optional) - For media delivery

---

Next: [Architecture →](./02-architecture.md)
