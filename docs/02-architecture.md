# Architecture

## 🏗️ System Architecture

GCET Blog follows a modern, layered architecture pattern optimized for Next.js and Payload CMS integration.

## 📐 Architectural Layers

```
┌─────────────────────────────────────────────────────┐
│                   Presentation Layer                 │
│  (Next.js App Router + React Components)            │
├─────────────────────────────────────────────────────┤
│                   Application Layer                  │
│  (Server Actions + API Routes + Middleware)         │
├─────────────────────────────────────────────────────┤
│                   Business Logic Layer               │
│  (Payload CMS Collections + Access Control)         │
├─────────────────────────────────────────────────────┤
│                   Data Access Layer                  │
│  (Payload CMS ORM + MongoDB)                        │
└─────────────────────────────────────────────────────┘
```

## 🎨 Presentation Layer

### Route Groups Architecture

The app uses Next.js route groups to maintain separation of concerns:

```
app/
├── layout.tsx                    # Root layout (pass-through only)
├── (frontend)/                   # Public blog
│   ├── layout.tsx               # Has <html>, <body>, Header, Footer
│   ├── page.tsx                 # Homepage
│   ├── posts/                   # Blog post pages
│   ├── dashboard/               # Contributor dashboard
│   └── editor/                  # Editor dashboard
├── (auth)/                       # Authentication
│   ├── layout.tsx               # Has <html>, <body>, minimal UI
│   ├── login/                   # Login page
│   └── register/                # Registration page
└── (payload)/                    # CMS Admin
    └── layout.tsx               # Payload's RootLayout (own HTML)
```

### Why This Structure?

1. **Isolation**: Each route group has complete control over its HTML structure
2. **No Conflicts**: Payload CMS needs its own `<html>` tags, separate from our frontend
3. **Layout Independence**: Auth pages don't need Header/Footer
4. **Performance**: Only load what's needed for each section

### Component Hierarchy

```
RootLayout (pass-through)
│
├── FrontendLayout (<html>, <body>, Providers)
│   ├── Header
│   │   ├── Logo
│   │   ├── Nav
│   │   └── AuthButton (uses UserContext)
│   ├── {children} (page content)
│   └── Footer
│
├── AuthLayout (<html>, <body>, Providers)
│   ├── Logo + Back Button
│   ├── {children} (login/register forms)
│   └── Simple Footer
│
└── PayloadLayout (Payload's own <html>, <body>)
    └── Admin Panel UI
```

## ⚡ Application Layer

### Server Actions

Server Actions handle mutations and are defined in action files:

```typescript
// Example: src/app/(auth)/login/actions.ts
'use server'

export async function loginAction(formData: FormData) {
  // 1. Extract data
  // 2. Validate
  // 3. Call Payload API
  // 4. Set cookies
  // 5. Return result
}
```

**Benefits:**
- Type-safe by default
- No API routes needed for simple mutations
- Automatic serialization
- Progressive enhancement

### API Routes

API routes provide REST endpoints for external access or complex operations:

```
app/api/
├── auth/
│   ├── me/route.ts          # Get current user
│   └── logout/route.ts      # Logout endpoint
├── users/
│   └── me/route.ts          # User details
└── role-requests/
    └── route.ts             # Role upgrade requests
```

**When to use:**
- External API access needed
- Webhook endpoints
- Third-party integrations
- Complex data transformations

### Middleware

```typescript
// src/middleware.ts
export async function middleware(request: NextRequest) {
  // 1. Check authentication
  // 2. Validate role permissions
  // 3. Redirect if unauthorized
  // 4. Allow if authorized
}
```

**Protected Routes:**
- `/dashboard/*` - Contributors only
- `/editor/*` - Editors and Admins only
- `/admin/*` - Admins only (also protected by Payload)

## 🧠 Business Logic Layer

### Payload CMS Collections

Collections define data models and business logic:

```
src/collections/
├── Users.ts              # User accounts with roles
├── Posts.ts              # Blog posts
├── Pages.ts              # Static pages
├── Categories.ts         # Post categories
├── Media.ts              # Uploaded files
├── Comments.ts           # Post comments
├── AdminLogs.ts          # Activity logging

```

### Access Control

Each collection has fine-grained access control:

```typescript
// Example: Posts collection
{
  access: {
    read: authenticatedOrPublished,  // Public can read published
    create: authenticated,            // Logged in can create
    update: contributorOwn,          // Only creator can update
    delete: editorOrAdmin,           // Editors+ can delete
  }
}
```

### Hooks

Payload hooks provide lifecycle events:

```typescript
// Example: Auto-generate slug from title
{
  hooks: {
    beforeValidate: [formatSlug('title')],
    beforeChange: [populatePublishedAt],
  }
}
```

## 💾 Data Access Layer

### Payload CMS ORM

Payload provides a typed ORM for MongoDB:

```typescript
const posts = await payload.find({
  collection: 'posts',
  where: {
    status: { equals: 'published' }
  },
  sort: '-publishedAt',
  limit: 10
})
```

### Database Schema

MongoDB stores data in collections with flexible schemas defined by Payload:

```
MongoDB
├── users                 # User accounts
├── posts                 # Blog posts
├── pages                 # Static pages
├── categories            # Post categories
├── media                 # File uploads
├── comments              # Post comments
├── admin-logs            # Activity logs
├── role-upgrade-requests # User requests
└── payload-preferences   # User preferences
```

## 🔄 Data Flow Patterns

### Read Flow (Server Component)

```
User Request → Server Component
    ↓
Server Component fetches from Payload
    ↓
Payload queries MongoDB
    ↓
Data returned to component
    ↓
RSC renders HTML
    ↓
HTML sent to browser
```

### Mutation Flow (Server Action)

```
User submits form → Client component
    ↓
Calls Server Action
    ↓
Server Action validates data
    ↓
Calls Payload API
    ↓
Payload updates MongoDB
    ↓
Revalidates cache / Redirects
    ↓
UI updates
```

### Authentication Flow

```
User logs in → LoginForm
    ↓
Calls loginAction (Server Action)
    ↓
Payload authenticates user
    ↓
Token stored in HTTP-only cookie
    ↓
Redirect to dashboard
    ↓
UserProvider fetches user data
    ↓
Header updates with user info
```

## 🎯 State Management

### Server State
- Handled by React Server Components
- Data fetched on server, passed as props
- No client-side state management needed

### Client State
- React Context for global state (UserContext)
- useState for local component state
- No Redux/Zustand needed

### UserContext Pattern

```typescript
// Provider wraps app
<UserProvider>
  <App />
</UserProvider>

// Components consume context
const { user, loading } = useUser()
```

**What it manages:**
- Current user data
- Authentication status
- Loading states
- User refresh/logout functions

## 🔐 Security Architecture

### Defense in Depth

1. **Network Layer**: HTTPS only in production
2. **Application Layer**: Middleware auth checks
3. **Business Logic Layer**: Payload access control
4. **Data Layer**: Sanitized queries, no raw MongoDB access

### Authentication Security

```
┌──────────────────────────────────────┐
│ User Login                            │
└──────────────────────────────────────┘
            ↓
┌──────────────────────────────────────┐
│ Server Action validates credentials  │
└──────────────────────────────────────┘
            ↓
┌──────────────────────────────────────┐
│ Payload generates JWT token          │
└──────────────────────────────────────┘
            ↓
┌──────────────────────────────────────┐
│ Token stored in HTTP-only cookie     │
│ - Secure: true (production)          │
│ - SameSite: lax                       │
│ - MaxAge: 7 days                      │
└──────────────────────────────────────┘
            ↓
┌──────────────────────────────────────┐
│ Middleware validates token on each   │
│ request to protected routes          │
└──────────────────────────────────────┘
```

### Authorization Levels

```
Admin
  ├── All Editor permissions
  └── User management
  
Editor  
  ├── All Contributor permissions
  ├── Publish any post
  └── Manage categories

Contributor
  ├── Create own posts
  ├── Edit own posts
  └── Comment on posts
```

## 🚀 Performance Optimizations

### Server-Side Rendering
- Initial page load fully rendered
- SEO optimized
- Fast first contentful paint

### Client-Side Navigation
- Next.js Link prefetching
- Instant page transitions
- Optimistic updates

### Caching Strategy
```
Static Content:
  - Build-time generation (SSG)
  - CDN caching
  
Dynamic Content:
  - ISR with revalidation
  - On-demand revalidation
  
API Responses:
  - Cache-Control headers
  - Stale-while-revalidate
```

## 🧩 Extension Points

### Adding New Routes

1. Determine route group: `(frontend)`, `(auth)`, or new group
2. Create page.tsx and layout.tsx if needed
3. Add to middleware protection if needed
4. Update navigation components

### Adding New Collections

1. Create collection file in `src/collections/`
2. Define schema and access control
3. Add to `payload.config.ts`
4. Generate types: `npm run payload:generate-types`

### Adding New Components

1. Create in `src/components/`
2. Follow existing patterns (Server vs Client)
3. Add to appropriate index.ts for exports
4. Document props with TypeScript

### Adding New Server Actions

1. Create in route's `actions.ts` file
2. Mark with `'use server'`
3. Validate inputs
4. Return serializable data
5. Handle errors gracefully

---

Next: [Folder Structure →](./03-folder-structure.md)
