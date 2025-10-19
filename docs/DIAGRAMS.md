# System Diagrams & Visual Guides

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         GCET Blog System                         │
└─────────────────────────────────────────────────────────────────┘

                    ┌──────────────────┐
                    │   Next.js App    │
                    │   (Frontend)     │
                    └────────┬─────────┘
                             │
                ┌────────────┼────────────┐
                │            │            │
        ┌───────▼──────┐ ┌──▼────────┐ ┌▼───────────┐
        │  (frontend)  │ │   (auth)  │ │  (payload) │
        │  Route Group │ │Route Group│ │Route Group │
        └───────┬──────┘ └──┬────────┘ └┬───────────┘
                │           │            │
                ├───────────┴────────────┤
                │                        │
        ┌───────▼────────┐      ┌───────▼────────┐
        │  Middleware    │      │  Payload CMS   │
        │  (Protection)  │      │  (Business     │
        └────────┬───────┘      │   Logic)       │
                 │              └───────┬────────┘
                 │                      │
                 └──────────┬───────────┘
                            │
                    ┌───────▼────────┐
                    │    MongoDB     │
                    │   (Database)   │
                    └────────────────┘
```

## 🗺️ Route Flow Diagram

```
User Request → Middleware Check → Route Handler
                    │
                    ├── Not Protected → Render Page
                    │
                    ├── Protected + Authenticated → Render Page
                    │
                    └── Protected + Not Authenticated → Redirect to /login

Example Flows:

1. Public Page:
   / → (no middleware) → Homepage → Render

2. Login:
   /login → (no middleware) → Login Page → Render

3. Dashboard (Authorized):
   /dashboard → middleware → check token → valid → Dashboard → Render

4. Dashboard (Unauthorized):
   /dashboard → middleware → check token → invalid → Redirect /login

5. Admin (Wrong Role):
   /admin → middleware → check token → contributor role → Redirect /dashboard
```

## 🔐 Authentication Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                      Login Process                                │
└──────────────────────────────────────────────────────────────────┘

User enters credentials
         │
         ▼
    LoginForm (Client Component)
         │
         ▼
    loginAction (Server Action)
         │
         ├──> Validate credentials
         │
         ├──> Call Payload CMS auth
         │
         ├──> Generate JWT token
         │
         ├──> Set HTTP-only cookie
         │         payload-token = <JWT>
         │         HttpOnly: true
         │         Secure: true (production)
         │         SameSite: lax
         │         MaxAge: 7 days
         │
         ├──> Determine redirect path
         │    ├─> Admin → /admin
         │    ├─> Editor → /editor
         │    └─> Contributor → /dashboard
         │
         ▼
    Return { success: true, redirectPath }
         │
         ▼
    Client redirects
         │
         ▼
    Protected page loads
         │
         ├──> Middleware validates token
         │
         ├──> UserProvider fetches user data
         │
         ▼
    Header updates with user info
```

## 👤 User Role Hierarchy

```
                    ┌───────────┐
                    │   Admin   │
                    │  (Full    │
                    │  Access)  │
                    └─────┬─────┘
                          │
                    ┌─────▼─────┐
                    │  Editor   │
                    │  (Publish │
                    │   Posts)  │
                    └─────┬─────┘
                          │
                    ┌─────▼──────┐
                    │Contributor │
                    │(Create Own │
                    │   Posts)   │
                    └────────────┘

Permissions Matrix:

Action              │ Contributor │ Editor │ Admin │
────────────────────┼─────────────┼────────┼───────┤
Create own post     │      ✅     │   ✅   │   ✅  │
Edit own post       │      ✅     │   ✅   │   ✅  │
Delete own post     │      ❌     │   ✅   │   ✅  │
Edit any post       │      ❌     │   ✅   │   ✅  │
Publish post        │      ❌     │   ✅   │   ✅  │
Delete any post     │      ❌     │   ✅   │   ✅  │
Manage categories   │      ❌     │   ✅   │   ✅  │
Manage users        │      ❌     │   ❌   │   ✅  │
System settings     │      ❌     │   ❌   │   ✅  │
Access /dashboard   │      ✅     │   ✅   │   ✅  │
Access /editor      │      ❌     │   ✅   │   ✅  │
Access /admin       │      ❌     │   ❌   │   ✅  │
```

## 🎨 Component Hierarchy

```
App (Root Layout)
│
├─── (frontend) Layout
│    ├─── Providers
│    │    ├─── UserProvider
│    │    ├─── ThemeProvider
│    │    └─── AuthProvider
│    │
│    ├─── Header
│    │    ├─── Logo
│    │    ├─── Nav
│    │    │    └─── Link (x N)
│    │    └─── AuthButton
│    │         ├─── Uses: useUser()
│    │         ├─── If logged in: Dashboard link + LogoutButton
│    │         └─── If logged out: Sign In link
│    │
│    ├─── Page Content (Children)
│    │    └─── [Varies by route]
│    │
│    └─── Footer
│         ├─── Links
│         └─── Copyright
│
├─── (auth) Layout
│    ├─── Providers
│    ├─── Logo + Back Button
│    ├─── Page Content (Children)
│    │    ├─── LoginForm
│    │    └─── RegisterForm
│    └─── Simple Footer
│
└─── (payload) Layout
     └─── Payload's RootLayout
          └─── Admin Panel UI
```

## 🔄 Data Flow: Creating a Post

```
┌────────────────────────────────────────────────────────────┐
│                  Create Post Flow                          │
└────────────────────────────────────────────────────────────┘

User clicks "New Post"
         │
         ▼
Navigate to /dashboard/new
         │
         ▼
PostForm renders (Client Component)
         │
         ├──> User fills title, content, category
         │
         ▼
User clicks "Save Draft"
         │
         ▼
Call createPostAction (Server Action)
         │
         ├──> Validate user is authenticated
         │    └──> If not: return error
         │
         ├──> Validate form data
         │    └──> If invalid: return errors
         │
         ├──> Call Payload API
         │    payload.create({
         │      collection: 'posts',
         │      data: {
         │        title,
         │        content,
         │        category,
         │        author: user.id,
         │        status: 'draft'
         │      }
         │    })
         │
         ├──> Post created in MongoDB
         │
         ├──> Revalidate cache
         │    revalidatePath('/dashboard')
         │
         ▼
Return { success: true, id: postId }
         │
         ▼
Client receives response
         │
         ├──> Show success message
         │
         ▼
Redirect to /dashboard/posts/[id]
```

## 📊 State Management Diagram

```
┌────────────────────────────────────────────────────────────┐
│              Client-Side State Management                  │
└────────────────────────────────────────────────────────────┘

UserProvider (Context)
         │
         ├──> State:
         │    ├── user: User | null
         │    ├── loading: boolean
         │    └── error: string | null
         │
         ├──> Methods:
         │    ├── refreshUser()
         │    └── clearUser()
         │
         ├──> Effects:
         │    ├── Fetch user on mount
         │    ├── Refresh every 5 minutes
         │    └── Refresh on protected route navigation
         │
         └──> Consumers:
              ├── Header/AuthButton
              ├── Dashboard pages
              ├── LogoutButton
              └── Any component using useUser()

Data Flow:

Component calls useUser()
         │
         ▼
Reads from UserContext
         │
         ├──> If loading: show skeleton
         ├──> If user: show user data
         └──> If no user: show login prompt

User logs in
         │
         ▼
loginAction sets cookie
         │
         ▼
Page redirects
         │
         ▼
UserProvider fetches user
         │
         ▼
All consuming components update
```

## 🗄️ Database Schema

```
MongoDB Database: gcet-blog
│
├── users
│   ├── _id: ObjectId
│   ├── email: string (unique)
│   ├── password: string (hashed)
│   ├── name: string
│   ├── role: 'contributor' | 'editor' | 'admin'
│   ├── createdAt: Date
│   └── updatedAt: Date
│
├── posts
│   ├── _id: ObjectId
│   ├── title: string
│   ├── slug: string (unique)
│   ├── content: RichText
│   ├── author: ref → users._id
│   ├── status: 'draft' | 'published'
│   ├── publishedAt: Date
│   ├── category: ref → categories._id
│   ├── createdAt: Date
│   └── updatedAt: Date
│
├── categories
│   ├── _id: ObjectId
│   ├── name: string
│   ├── slug: string (unique)
│   └── description: string
│
├── comments
│   ├── _id: ObjectId
│   ├── content: string
│   ├── author: ref → users._id
│   ├── post: ref → posts._id
│   ├── parent: ref → comments._id (nullable)
│   ├── createdAt: Date
│   └── updatedAt: Date
│
├── media
│   ├── _id: ObjectId
│   ├── filename: string
│   ├── mimeType: string
│   ├── filesize: number
│   ├── width: number
│   ├── height: number
│   └── url: string
│
└── admin-logs
    ├── _id: ObjectId
    ├── user: ref → users._id
    ├── action: string
    ├── collection: string
    ├── documentId: string
    └── timestamp: Date
```

## 🚦 Request Lifecycle

```
1. Browser Request
         │
         ▼
2. Next.js Server
         │
         ▼
3. Middleware
    ├── Extract token from cookie
    ├── Validate token with Payload
    ├── Check route protection
    ├── Check user role
    └── Allow or redirect
         │
         ▼
4. Route Handler (Page/API)
    ├── Server Component: Fetch data
    ├── API Route: Process request
    └── Server Action: Mutate data
         │
         ▼
5. Payload CMS (if data needed)
    ├── Check access control
    ├── Query MongoDB
    └── Return data
         │
         ▼
6. Response Generation
    ├── RSC render to HTML
    ├── Send to browser
    └── Hydrate client components
         │
         ▼
7. Browser
    ├── Display HTML
    ├── Run client JavaScript
    └── Interactive page ready
```

## 📱 Responsive Layout

```
┌──────────────────────────────────────────────────────┐
│              Desktop (1024px+)                       │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │              Header                            │ │
│  │  [Logo]  [Nav Links]       [Dashboard] [👤]   │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │                                                │ │
│  │              Main Content                      │ │
│  │                                                │ │
│  │  [Post Content in wide container]             │ │
│  │                                                │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │              Footer                            │ │
│  │  [Links] [Social] [Copyright]                 │ │
│  └────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────┐
│     Mobile (< 768px)         │
│                              │
│  ┌────────────────────────┐ │
│  │  [Logo]  [≡ Menu]      │ │
│  └────────────────────────┘ │
│                              │
│  ┌────────────────────────┐ │
│  │                        │ │
│  │   Main Content         │ │
│  │   (Full width)         │ │
│  │                        │ │
│  └────────────────────────┘ │
│                              │
│  ┌────────────────────────┐ │
│  │  Footer                │ │
│  │  (Stacked)             │ │
│  └────────────────────────┘ │
└──────────────────────────────┘
```

## 🔄 Deployment Pipeline

```
Developer
    │
    ├─> Write code
    ├─> Run tests locally
    ├─> Commit to git
    │
    ▼
GitHub
    │
    ├─> Push to branch
    ├─> Create Pull Request
    ├─> CI runs tests
    │
    ▼
Code Review
    │
    ├─> Review changes
    ├─> Approve
    ├─> Merge to main
    │
    ▼
Vercel (Auto Deploy)
    │
    ├─> Detect new commit
    ├─> Install dependencies
    ├─> Run build
    ├─> Run tests
    ├─> Deploy to staging
    ├─> Run E2E tests
    ├─> Deploy to production
    │
    ▼
Production
    │
    └─> Live at yourdomain.com
```

---

## 📊 Performance Metrics

```
Target Performance Metrics:

First Contentful Paint (FCP)    ≤ 1.8s  ████████████░░  80%
Largest Contentful Paint (LCP)  ≤ 2.5s  ████████████░░  85%
Time to Interactive (TTI)       ≤ 3.8s  ████████████░░  90%
Cumulative Layout Shift (CLS)   ≤ 0.1   ████████████░░  95%
First Input Delay (FID)         ≤ 100ms ████████████░░  100%

Lighthouse Score Targets:
Performance:   ≥ 90  ████████████████░░░░  80%
Accessibility: ≥ 95  ████████████████████  100%
Best Practices:≥ 90  ████████████████░░░░  85%
SEO:          ≥ 95  ████████████████████  100%
```

---

These diagrams provide visual representation of the system architecture. For detailed explanations, refer to the respective documentation sections.

**Related:**
- [Architecture](./02-architecture.md) - Detailed architecture explanation
- [Authentication](./04-authentication.md) - Auth flow details
- [Route Groups](./05-route-groups.md) - Routing explained
