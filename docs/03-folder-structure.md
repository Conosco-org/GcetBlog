# Folder Structure

## 📁 Complete Directory Tree

```
GcetBlog/
├── docs/                           # 📚 Documentation (you are here!)
├── public/                         # 🌐 Static assets
│   └── media/                      # Uploaded media files
├── src/                           # 💻 Source code
│   ├── app/                       # 🎯 Next.js App Router
│   │   ├── (auth)/               # 🔐 Authentication routes
│   │   ├── (frontend)/           # 🏠 Public-facing routes
│   │   ├── (payload)/            # ⚙️ CMS admin routes
│   │   ├── api/                  # 🔌 API endpoints
│   │   └── layout.tsx            # Root layout
│   ├── access/                    # 🔒 Access control functions
│   ├── blocks/                    # 🧱 Page builder blocks
│   ├── collections/               # 📦 Payload collections
│   ├── components/                # 🎨 React components
│   ├── endpoints/                 # 🔗 Custom Payload endpoints
│   ├── fields/                    # 📝 Reusable Payload fields
│   ├── Footer/                    # 👣 Footer component
│   ├── Header/                    # 🎩 Header component
│   ├── heros/                     # 🦸 Hero components
│   ├── hooks/                     # 🪝 Custom React hooks
│   ├── plugins/                   # 🔌 Payload plugins
│   ├── providers/                 # 🌳 React Context providers
│   ├── search/                    # 🔍 Search functionality
│   ├── utilities/                 # 🛠️ Helper functions
│   ├── middleware.ts             # 🚪 Route protection
│   ├── payload.config.ts         # ⚙️ Payload configuration
│   └── payload-types.ts          # 📘 Auto-generated types
├── tests/                         # 🧪 Test files
├── .env                          # 🔐 Environment variables
├── package.json                  # 📦 Dependencies
├── tsconfig.json                 # 📘 TypeScript config
├── tailwind.config.mjs           # 🎨 Tailwind config
└── next.config.js               # ⚙️ Next.js config
```

## 📂 Detailed Breakdown

### `/src/app/` - Application Routes

#### Root Files
```
app/
├── layout.tsx          # Root layout (pass-through only)
├── not-found.tsx       # 404 page
└── middleware.ts       # Route protection (lives in /src/)
```

**`layout.tsx`**
- Purpose: Root layout for entire app
- Behavior: Simply passes children through (no HTML tags)
- Why: Allows each route group to control its own HTML structure

---

#### `(auth)/` - Authentication Routes

```
(auth)/
├── layout.tsx                 # Auth-specific layout with HTML/body
├── login/
│   ├── page.tsx              # Login page (server component)
│   ├── LoginForm.tsx         # Login form (client component)
│   └── actions.ts            # Server actions (login, logout, getCurrentUser)
└── register/
    ├── page.tsx              # Registration page
    ├── RegisterForm.tsx      # Registration form
    └── actions.ts            # Registration server action
```

**Key Features:**
- Clean UI without Header/Footer
- Own HTML structure with Providers
- Logo and "Back to Home" button
- Gradient background design

**Files Explained:**

`layout.tsx`
- Provides: `<html>`, `<body>`, Providers, minimal header
- Used by: All auth pages
- Effects: Changes here affect login and register pages

`login/actions.ts`
- Exports: `loginAction()`, `logoutAction()`, `getCurrentUser()`
- Used by: LoginForm, API routes, server components
- Effects: Changes to login logic affect authentication flow

`login/LoginForm.tsx`
- Purpose: Client-side login form with validation
- Uses: Server actions from `actions.ts`
- Effects: UI changes only, logic in server action

---

#### `(frontend)/` - Public Blog Routes

```
(frontend)/
├── layout.tsx                    # Frontend layout with Header/Footer
├── globals.css                   # Global styles
├── page.tsx                      # Homepage
├── posts/
│   ├── page.tsx                 # Posts archive
│   └── [slug]/
│       └── page.tsx             # Individual post page
├── dashboard/                    # Contributor dashboard
│   ├── page.tsx                 # Dashboard home
│   └── account/                 # 🚧 PLANNED: Account settings
│       └── page.tsx
├── editor/                       # Editor dashboard
│   ├── page.tsx                 # Editor home
│   └── account/                 # 🚧 PLANNED: Editor account
│       └── page.tsx
├── [slug]/                       # Dynamic pages
│   └── page.tsx
├── search/
│   └── page.tsx                 # Search results
└── not-found.tsx                # 404 for frontend
```

**Key Features:**
- Full Header and Footer
- Own HTML structure with Providers
- Protected routes (dashboard, editor)
- Dynamic routing for posts and pages

**Files Explained:**

`layout.tsx`
- Provides: `<html>`, `<body>`, Providers, Header, Footer
- Used by: All frontend pages
- Effects: Changes affect entire public site appearance

`dashboard/page.tsx`
- Purpose: Contributor's dashboard
- Protected: Yes (contributors only)
- Future: Will link to `/dashboard/account` for profile settings

`editor/page.tsx`
- Purpose: Editor's dashboard
- Protected: Yes (editors and admins only)
- Future: Will link to `/editor/account` for editor settings

**🚧 Planned: Account Management**

```
dashboard/account/page.tsx       # Contributor profile settings
├── Edit profile information
├── Change password
├── Notification preferences
└── View own posts

editor/account/page.tsx          # Editor profile settings
├── Edit profile information
├── Change password
├── Editor preferences
└── Moderation settings

(Note: Admin account settings will be at /admin/account
within Payload CMS interface)
```

---

#### `(payload)/` - CMS Admin Panel

```
(payload)/
├── layout.tsx              # Payload's RootLayout (auto-generated)
├── admin/
│   └── importMap.js       # Auto-generated import map
└── custom.scss            # Custom admin panel styles
```

**Important:**
- This layout is auto-generated by Payload
- Has its own `<html>` and `<body>` tags
- Do NOT modify `layout.tsx` - it will be regenerated
- Customize admin panel via `custom.scss` or Payload config

**Access:**
- URL: `/admin`
- Protected: Admins only
- Purpose: Full CMS management interface

---

#### `api/` - API Routes

```
api/
├── auth/
│   ├── me/route.ts           # Get authenticated user
│   └── logout/route.ts       # Logout endpoint
├── users/
│   └── me/route.ts           # Get user details
└── role-requests/
    └── route.ts              # Submit role upgrade request
```

**Files Explained:**

`auth/me/route.ts`
- GET: Returns current authenticated user
- Used by: Legacy compatibility, prefer `/api/users/me`
- Effects: Changes affect authentication checks

`users/me/route.ts`
- GET: Returns current user with session validation
- Used by: UserProvider for client-side auth state
- Effects: Changes affect user data availability across app

`role-requests/route.ts`
- POST: Submit request to upgrade user role
- Used by: Contributors requesting editor role
- Effects: Changes affect role request workflow

---

### `/src/access/` - Access Control

```
access/
├── adminOnly.ts                # Admin-only access
├── adminOrSelf.ts             # Admin or resource owner
├── anyone.ts                  # Public access
├── authenticated.ts           # Any logged-in user
├── authenticatedOrPublished.ts # Public for published content
├── contributorOwn.ts          # Creator-only access
└── editorOrAdmin.ts           # Editors and admins
```

**Usage:**
These functions are used in Payload collection access control:

```typescript
// Example in Posts collection
{
  access: {
    read: authenticatedOrPublished,  // Public can read published posts
    create: authenticated,            // Logged-in users can create
    update: contributorOwn,          // Only creator can update
    delete: editorOrAdmin,           // Editors+ can delete
  }
}
```

**Effects:**
- Changes here affect WHO can access WHAT
- Used across all collections
- Critical for security

---

### `/src/blocks/` - Page Builder Blocks

```
blocks/
├── RenderBlocks.tsx           # Main renderer component
├── ArchiveBlock/             # Display post archives
├── Banner/                   # Hero banners
├── CallToAction/             # CTA sections
├── Code/                     # Code blocks
├── Content/                  # Rich text content
├── Form/                     # Form blocks
├── MediaBlock/               # Media display
└── RelatedPosts/             # Related posts widget
```

**Purpose:**
Flexible page builder components for creating custom layouts.

**Usage:**
```tsx
<RenderBlocks blocks={page.layout} />
```

**Effects:**
- New blocks added here become available in Payload page builder
- Changes affect page rendering

---

### `/src/collections/` - Payload Collections

```
collections/
├── Users.ts                   # User accounts
├── Posts.ts                   # Blog posts
├── Pages.ts                   # Static pages
├── Categories.ts              # Post categories
├── Media.ts                   # File uploads
├── Comments/                  # Comment system
│   ├── index.ts
│   ├── hooks/
│   └── access/
├── AdminLogs/                 # Activity logging
│   ├── index.ts
│   └── hooks/

    └── index.ts
```

**Each Collection Defines:**
1. Schema (fields and validation)
2. Access control (who can do what)
3. Hooks (lifecycle events)
4. Admin UI customization

**Key Collections:**

**`Users.ts`**
- Fields: email, name, role, password
- Roles: contributor, editor, admin
- Effects: Changes affect authentication and authorization

**`Posts.ts`**
- Fields: title, content, author, status, publishedAt
- Statuses: draft, published
- Effects: Changes affect blog post data structure

**`Comments.ts`**
- Fields: content, author, post, parent (for threading)
- Access: Authenticated users can create
- Effects: Changes affect comment system

---

### `/src/components/` - React Components

```
components/
├── AdminBar/                  # Admin toolbar
├── BeforeDashboard/          # Dashboard customization
├── BeforeLogin/              # Login page customization
├── Card/                     # Post card component
├── CollectionArchive/        # Post listings
├── CommentForm/              # Comment submission
├── CommentList/              # Comment display
├── Header/                   # Site header
│   ├── Component.tsx         # Server component
│   ├── Component.client.tsx  # Client wrapper
│   ├── config.ts            # Header configuration
│   ├── Nav/                 # Navigation
│   └── AuthButton.tsx       # Login/Dashboard button
├── Link/                     # Custom Link component
├── LivePreviewListener/      # Draft preview
├── Logo/                     # Site logo
├── LogoutButton/            # Logout functionality
├── Media/                    # Media components
├── PageRange/               # Pagination helper
├── Pagination/              # Pagination UI
├── PayloadRedirects/        # Redirect handling
├── PostComments/            # Post comment section
├── RichText/                # Rich text renderer
├── ui/                      # shadcn/ui components
│   ├── button.tsx
│   ├── input.tsx
│   ├── label.tsx
│   ├── card.tsx
│   └── ... (more UI primitives)
└── UserInfo/                # User profile widget
```

**Component Types:**

**Server Components** (default)
- Filename: `Component.tsx` or `*.tsx`
- Can fetch data directly
- Rendered on server
- Example: Header main component

**Client Components**
- Filename: `Component.client.tsx` or marked with `'use client'`
- Can use React hooks
- Interactive elements
- Example: AuthButton, LoginForm

**Effects:**
- Changes to Header affect entire (frontend) layout
- Changes to ui/ components affect app-wide styling
- New components should follow existing patterns

---

### `/src/providers/` - Context Providers

```
providers/
├── index.tsx                 # Combines all providers
├── Auth/                     # Payload auth provider
│   └── index.tsx
├── HeaderTheme/             # Header theme context
│   └── index.tsx
├── Theme/                   # Dark/light mode
│   ├── index.tsx
│   └── InitTheme.tsx
└── User/                    # User context provider
    └── index.tsx
```

**`User/index.tsx`** (Most Important)
- Manages: Current user state
- Exports: `useUser()` hook
- Used by: Header, protected pages, anywhere user data needed
- Effects: Changes affect authentication state across entire app

**Provider Hierarchy:**
```tsx
<Providers>
  <AuthProvider>        {/* Payload's auth */}
    <ThemeProvider>     {/* Dark mode */}
      <HeaderThemeProvider>  {/* Header styling */}
        <UserProvider>  {/* User state */}
          <App />
        </UserProvider>
      </HeaderThemeProvider>
    </ThemeProvider>
  </AuthProvider>
</Providers>
```

**Effects:**
- All wrapped by layout.tsx files
- Available to all child components
- Changes affect global state management

---

### `/src/utilities/` - Helper Functions

```
utilities/
├── canUseDOM.ts              # Check if running in browser
├── deepMerge.ts              # Deep object merging
├── formatAuthors.ts          # Format author names
├── formatDateTime.ts         # Date formatting
├── generateMeta.ts           # SEO metadata
├── generatePreviewPath.ts    # Draft preview URLs
├── getDocument.ts            # Fetch single document
├── getGlobals.ts             # Fetch global settings
├── getMediaUrl.ts            # Get media URLs
├── getMeUser.ts              # Get current user server-side
├── getRedirects.ts           # Get redirect rules
├── getURL.ts                 # Get site URL
├── mergeOpenGraph.ts         # Merge OG tags
├── toKebabCase.ts            # String formatting
├── ui.ts                     # UI utility functions
├── useClickableCard.ts       # Clickable card hook
└── useDebounce.ts            # Debounce hook
```

**Commonly Used:**

**`getMeUser.ts`**
- Purpose: Get current user in server components
- Usage: `const user = await getMeUser()`
- Effects: Changes affect server-side auth checks

**`generateMeta.ts`**
- Purpose: Generate page metadata for SEO
- Usage: Used in page metadata exports
- Effects: Changes affect SEO across site

---

### `/src/middleware.ts` - Route Protection

```typescript
// Location: /src/middleware.ts
export async function middleware(request: NextRequest) {
  // Protects routes based on user role
}

export const config = {
  matcher: ['/dashboard/:path*', '/editor/:path*', '/admin/:path*']
}
```

**Protected Routes:**
- `/dashboard/*` → Contributors, Editors, Admins
- `/editor/*` → Editors, Admins only
- `/admin/*` → Admins only

**Effects:**
- Changes affect route access control
- Runs before every matched request
- Critical for security

---

## 🎯 What Affects What

### Changing Authentication
**Files to modify:**
- `src/app/(auth)/login/actions.ts` - Login logic
- `src/providers/User/index.tsx` - User state
- `src/middleware.ts` - Route protection
- `src/access/*.ts` - Collection access

**Will affect:**
- All protected routes
- Header AuthButton
- API endpoints
- Collection access control

---

### Adding New Pages
**Files to modify:**
- Create `src/app/(frontend)/[name]/page.tsx`
- Update `src/components/Header/Nav/index.tsx` if adding to menu
- Add protection in `src/middleware.ts` if needed

**Will affect:**
- Site navigation
- Route access
- Sitemap generation

---

### Changing User Roles
**Files to modify:**
- `src/collections/Users.ts` - Add new role
- `src/access/*.ts` - Add role-specific access
- `src/middleware.ts` - Add role routing
- TypeScript types will auto-generate

**Will affect:**
- Access control throughout app
- Dashboard redirects
- Collection permissions

---

### Modifying Header/Footer
**Files to modify:**
- `src/components/Header/` - Header changes
- `src/Footer/` - Footer changes
- `src/app/(frontend)/layout.tsx` - If changing structure

**Will affect:**
- All frontend pages (not auth or admin)
- Navigation behavior
- Global UI appearance

---

## 📝 Important File Relationships

```
Page Load Flow:
layout.tsx (root)
  ↓
(frontend)/layout.tsx
  ↓
Header/Component.tsx
  ↓
Header/AuthButton.tsx → uses useUser()
  ↓
providers/User/index.tsx → fetches from /api/users/me
  ↓
app/api/users/me/route.ts → calls Payload auth
```

```
Authentication Flow:
LoginForm.tsx (client)
  ↓
(auth)/login/actions.ts (server)
  ↓
Payload CMS
  ↓
Cookie set
  ↓
Redirect to dashboard
  ↓
Middleware validates
  ↓
UserProvider fetches user
  ↓
Header updates
```

---

Next: [Authentication System →](./04-authentication.md)
