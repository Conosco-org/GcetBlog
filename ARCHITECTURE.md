# 🏗️ Architecture Overview

Visual guide to understanding how GCET Blog is structured.

---

## 🌐 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User's Browser                       │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐  │
│  │   Public    │  │    Admin    │  │     API      │  │
│  │   Website   │  │    Panel    │  │  Endpoints   │  │
│  │      /      │  │   /admin    │  │    /api/*    │  │
│  └─────────────┘  └─────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                        ↕ HTTP
┌─────────────────────────────────────────────────────────┐
│               Next.js 15 + Payload CMS                  │
│                                                         │
│  ┌────────────────────────────────────────────────┐   │
│  │           Frontend (Next.js)                   │   │
│  │  • App Router (src/app)                        │   │
│  │  • React Components (src/components)           │   │
│  │  • Blocks (src/blocks)                         │   │
│  └────────────────────────────────────────────────┘   │
│                        ↕                                │
│  ┌────────────────────────────────────────────────┐   │
│  │           Backend (Payload CMS)                │   │
│  │  • Collections (src/collections)               │   │
│  │  • Access Control (src/access)                 │   │
│  │  • Hooks (src/hooks)                           │   │
│  └────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                        ↕ Database Queries
┌─────────────────────────────────────────────────────────┐
│                    MongoDB Database                     │
│                                                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌──────────┐   │
│  │  Users  │ │  Posts  │ │  Pages  │ │  Media   │   │
│  └─────────┘ └─────────┘ └─────────┘ └──────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow

### Creating a Blog Post

```
┌────────────┐
│   Editor   │
│   Login    │
└─────┬──────┘
      │ 1. Authenticate
      ↓
┌────────────────┐
│  Admin Panel   │
│  /admin/posts  │
└────────┬───────┘
         │ 2. Create Post
         │    - Title: "My Post"
         │    - Content: Rich text
         │    - Status: Draft
         ↓
┌─────────────────────────┐
│  Payload CMS Backend    │
│  • Validate data        │
│  • Check permissions    │
│  • Generate slug        │
│  • Run hooks            │
└────────┬────────────────┘
         │ 3. Save to DB
         ↓
┌─────────────────┐
│  MongoDB        │
│  posts: {       │
│   title: "..."  │
│   slug: "..."   │
│   _status: ...  │
│  }              │
└────────┬────────┘
         │ 4. Publish
         ↓
┌─────────────────────────┐
│  Revalidation Hook      │
│  • Clear Next.js cache  │
│  • Update sitemap       │
└────────┬────────────────┘
         │ 5. Live!
         ↓
┌────────────────┐
│  Public Site   │
│  /posts/my-post│
└────────────────┘
```

### Reading a Page

```
User visits: /about
      ↓
┌──────────────────────────┐
│  Next.js Router          │
│  /app/(frontend)/[slug]/ │
└──────────┬───────────────┘
           │
           ↓
┌──────────────────────────────┐
│  Page Component              │
│  1. Parse slug from URL      │
│  2. Query Payload for "about"│
└──────────┬───────────────────┘
           │
           ↓
┌──────────────────────────────┐
│  Payload CMS                 │
│  • Check read permissions    │
│  • Query MongoDB             │
│  • Return page data          │
└──────────┬───────────────────┘
           │
           ↓
┌──────────────────────────────┐
│  Page Component              │
│  3. Render hero              │
│  4. Render blocks            │
│  5. Send HTML to browser     │
└──────────────────────────────┘
```

---

## 🗂️ Directory Structure Map

```
GcetBlog/
│
├── 📱 FRONTEND
│   ├── src/app/(frontend)/
│   │   ├── [slug]/          ← Dynamic pages
│   │   ├── posts/           ← Blog section
│   │   ├── dashboard/       ← User dashboards
│   │   └── login/           ← Authentication
│   │
│   ├── src/components/      ← Reusable UI
│   │   ├── ui/              ← Base components
│   │   ├── Card/
│   │   ├── Media/
│   │   └── RichText/
│   │
│   └── src/blocks/          ← Page building blocks
│       ├── Content/
│       ├── MediaBlock/
│       └── CallToAction/
│
├── 🔧 BACKEND
│   ├── src/collections/     ← Data models
│   │   ├── Users/           ← User accounts
│   │   ├── Posts/           ← Blog posts
│   │   ├── Pages/           ← Static pages
│   │   └── Media.ts         ← File uploads
│   │
│   ├── src/access/          ← Permissions
│   │   ├── authenticated.ts
│   │   ├── adminOnly.ts
│   │   └── editorOrAdmin.ts
│   │
│   └── src/hooks/           ← Lifecycle events
│
├── ⚙️ CONFIG
│   ├── src/payload.config.ts  ← CMS configuration
│   ├── next.config.js         ← Next.js config
│   └── tailwind.config.mjs    ← Styling config
│
└── 📦 PUBLIC
    └── public/
        └── media/           ← Uploaded files
```

---

## 🔐 Permission Flow

```
User makes request
       ↓
┌─────────────────┐
│ Is user logged  │ No  → Return 401
│     in?         │
└────────┬────────┘
         │ Yes
         ↓
┌─────────────────┐
│ What is user's  │
│     role?       │
└────────┬────────┘
         │
    ┌────┴─────┬──────────┬─────────┐
    ↓          ↓          ↓         ↓
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│Contrib-│ │ Editor │ │Modera- │ │ Admin  │
│ utor   │ │        │ │ tor    │ │        │
└───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘
    │          │          │          │
    ↓          ↓          ↓          ↓
Can:        Can:        Can:        Can:
• Create    • Create    • Create    • Everything
  drafts      posts       posts    • Manage users
• Edit own  • Edit all  • Edit all • Delete content
  posts       posts       posts    • Change roles
• View      • Publish   • Moderate
  feedback    posts       comments
            • Give
              feedback
```

---

## 🧩 Block System

```
Page in Admin Panel
        ↓
┌────────────────────────────┐
│  Layout Builder            │
│                            │
│  ┌──────────────────────┐ │
│  │  Hero Section        │ │ ← Configured once per page
│  │  (High/Medium/Low)   │ │
│  └──────────────────────┘ │
│                            │
│  ┌──────────────────────┐ │
│  │  Content Block       │ │ ← User adds these
│  │  (Text columns)      │ │
│  └──────────────────────┘ │
│                            │
│  ┌──────────────────────┐ │
│  │  Media Block         │ │
│  │  (Image/Video)       │ │
│  └──────────────────────┘ │
│                            │
│  ┌──────────────────────┐ │
│  │  CTA Block           │ │
│  │  (Call to action)    │ │
│  └──────────────────────┘ │
│                            │
│  [ Add Block ▼ ]          │
│                            │
└────────────────────────────┘
        ↓
    Saved to DB
        ↓
┌────────────────────────────┐
│  Frontend Rendering        │
│                            │
│  RenderHero(hero)          │
│  RenderBlocks([           │
│    ContentBlock,           │
│    MediaBlock,             │
│    CTABlock                │
│  ])                        │
└────────────────────────────┘
        ↓
   Displayed to User
```

---

## 🔄 Collection Relationships

```
┌─────────────┐
│    User     │
│             │
│ • name      │
│ • email     │
│ • role      │
│ • avatar    │◄─────┐
└──────┬──────┘      │
       │ author      │
       │             │
       ↓             │
┌─────────────┐      │ relationship
│    Post     │      │
│             │      │
│ • title     │      │
│ • slug      │      │
│ • content   │      │
│ • authors[] ├──────┘
│ • heroImage ├──────┐
└──────┬──────┘      │
       │             │
       │ belongs to  │
       ↓             ↓
┌─────────────┐   ┌─────────────┐
│  Category   │   │    Media    │
│             │   │             │
│ • name      │   │ • url       │
│ • parent    │   │ • alt       │
└─────────────┘   │ • sizes[]   │
                  └─────────────┘
```

---

## 🚀 Request Lifecycle

### SSR (Server-Side Rendered) Page

```
1. Browser → GET /about
2. Next.js → Page component runs on server
3. Page → Query Payload for "about" page
4. Payload → Check permissions
5. Payload → Query MongoDB
6. MongoDB → Return page data
7. Page → Render with data
8. Next.js → Generate HTML
9. Browser ← Receive complete HTML
10. Browser → Hydrate React components
```

### API Route

```
1. Browser → POST /api/comments
2. Next.js → Route handler runs
3. Handler → Validate request
4. Handler → Get Payload instance
5. Payload → Check permissions
6. Payload → Create document
7. MongoDB → Save data
8. Payload → Run afterChange hooks
9. Handler → Return JSON response
10. Browser ← Receive response
```

---

## 💡 Key Concepts Visualized

### Slug Generation

```
Input: Title = "Hello World! 123"
       ↓
Step 1: Lowercase
       "hello world! 123"
       ↓
Step 2: Replace spaces with hyphens
       "hello-world!-123"
       ↓
Step 3: Remove special characters
       "hello-world-123"
       ↓
Output: slug = "hello-world-123"
```

### Access Control Decision Tree

```
Can user perform action?
       ↓
   ┌───┴───┐
   │Access │
   │Function
   └───┬───┘
       │
   Returns?
       ↓
   ┌───┴────┐
   │        │
   ↓        ↓
true     { query }  → Filters results
   │                  based on conditions
   ↓
Allow               
action
```

---

## 🎯 Summary

- **Collections** define your data structure
- **Access functions** control permissions
- **Blocks** make pages flexible
- **Hooks** add custom logic
- **Slugs** create SEO-friendly URLs
- **Next.js** handles routing and rendering
- **Payload** manages content and provides admin UI
- **MongoDB** stores all data

For detailed explanations, see [CODEBASE_GUIDE.md](./CODEBASE_GUIDE.md)
