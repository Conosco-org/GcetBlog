# Pages Audit Report

Generated: April 6, 2026

## Summary

Total Pages: 82 files
- page.tsx: 54 files
- layout.tsx: 7 files
- loading.tsx: 16 files
- error.tsx: 2 files
- not-found.tsx: 2 files

---

## Root Layout

### `/` - Root Layout
**File:** `src/app/layout.tsx`
**Type:** Server Component (layout)
**Has Metadata:** Yes (should have)
**Has loading.tsx:** N/A (root layout)
**Has error.tsx:** N/A (root layout)
**Issues:** None

---

## Authentication Routes (`/(auth)/`)

### `/login` - Login Page
**File:** `src/app/(auth)/login/page.tsx`
**Type:** Client Component (form)
**Has Metadata:** Should have
**Has loading.tsx:** ❌ Missing
**Has error.tsx:** ❌ Missing
**Layout:** `src/app/(auth)/layout.tsx` ✓

### `/register` - Registration Page
**File:** `src/app/(auth)/register/page.tsx`
**Type:** Client Component (form)
**Has Metadata:** Should have
**Has loading.tsx:** ❌ Missing
**Has error.tsx:** ❌ Missing
**Layout:** `src/app/(auth)/layout.tsx` ✓

### `/set-password` - Set Password Page
**File:** `src/app/(auth)/set-password/page.tsx`
**Type:** Client Component (form)
**Has Metadata:** Should have
**Has loading.tsx:** ❌ Missing
**Has error.tsx:** ❌ Missing
**Layout:** `src/app/(auth)/layout.tsx` ✓

---

## Public Frontend Routes (`/(frontend)/`)

### `/` - Landing Page
**File:** `src/app/(frontend)/page.tsx`
**Type:** Server Component
**Has Metadata:** Should have
**Has loading.tsx:** ❌ Missing
**Has error.tsx:** ❌ Missing
**Layout:** `src/app/(frontend)/layout.tsx` ✓

### `/home` - Home Page (Duplicate?)
**File:** `src/app/(frontend)/home/page.tsx`
**Type:** Server Component
**Has Metadata:** Should have
**Has loading.tsx:** ✓ `src/app/(frontend)/home/loading.tsx`
**Has error.tsx:** ❌ Missing
**Layout:** `src/app/(frontend)/layout.tsx` ✓
**Issues:** ⚠️ Might be duplicate of `/` — investigate

### `/posts` - Posts Listing
**File:** `src/app/(frontend)/posts/page.tsx`
**Type:** Server Component
**Has Metadata:** Should have
**Has loading.tsx:** ✓ `src/app/(frontend)/posts/loading.tsx`
**Has error.tsx:** ❌ Missing
**Layout:** `src/app/(frontend)/layout.tsx` ✓

### `/posts/[slug]` - Individual Post
**File:** `src/app/(frontend)/posts/[slug]/page.tsx`
**Type:** Server Component
**Has Metadata:** Should have (dynamic)
**Has loading.tsx:** ✓ `src/app/(frontend)/posts/[slug]/loading.tsx`
**Has error.tsx:** ❌ Missing
**Has not-found.tsx:** ❌ Missing (should have for invalid slugs)
**Layout:** `src/app/(frontend)/layout.tsx` ✓

### `/posts/page/[pageNumber]` - Paginated Posts
**File:** `src/app/(frontend)/posts/page/[pageNumber]/page.tsx`
**Type:** Server Component
**Has Metadata:** Should have
**Has loading.tsx:** ❌ Missing
**Has error.tsx:** ❌ Missing
**Has not-found.tsx:** ❌ Missing
**Layout:** `src/app/(frontend)/layout.tsx` ✓

### `/search` - Search Results
**File:** `src/app/(frontend)/search/page.tsx`
**Type:** Server Component
**Has Metadata:** Should have
**Has loading.tsx:** ❌ Missing
**Has error.tsx:** ❌ Missing
**Layout:** `src/app/(frontend)/layout.tsx` ✓

### `/profile/[id]` - User Profile
**File:** `src/app/(frontend)/profile/[id]/page.tsx`
**Type:** Server Component
**Has Metadata:** Should have (dynamic)
**Has loading.tsx:** ❌ Missing
**Has error.tsx:** ❌ Missing
**Has not-found.tsx:** ❌ Missing (should have for invalid IDs)
**Layout:** `src/app/(frontend)/layout.tsx` ✓

### `/[slug]` - Dynamic Pages
**File:** `src/app/(frontend)/[slug]/page.tsx`
**Type:** Server Component
**Has Metadata:** Should have (dynamic)
**Has loading.tsx:** ✓ `src/app/(frontend)/[slug]/loading.tsx`
**Has error.tsx:** ❌ Missing
**Has not-found.tsx:** ❌ Missing (should have for invalid slugs)
**Layout:** `src/app/(frontend)/layout.tsx` ✓

---

## Dashboard Routes (`/(frontend)/dashboard/`)

### `/dashboard` - Dashboard Home
**File:** `src/app/(frontend)/dashboard/page.tsx`
**Type:** Server Component (role-based redirect)
**Has Metadata:** Should have
**Has loading.tsx:** ❌ Missing
**Has error.tsx:** ❌ Missing
**Layout:** ✓ `src/app/(frontend)/dashboard/layout.tsx`

### `/dashboard/admin` - Admin Dashboard
**File:** `src/app/(frontend)/dashboard/admin/page.tsx`
**Type:** Server Component
**Has Metadata:** Should have
**Has loading.tsx:** ❌ Missing
**Has error.tsx:** ❌ Missing
**Layout:** ✓ `src/app/(frontend)/dashboard/layout.tsx`

### `/dashboard/editor` - Editor Dashboard
**File:** `src/app/(frontend)/dashboard/editor/page.tsx`
**Type:** Server Component
**Has Metadata:** Should have
**Has loading.tsx:** ❌ Missing
**Has error.tsx:** ❌ Missing
**Layout:** ✓ `src/app/(frontend)/dashboard/layout.tsx`

### `/dashboard/user` - User Dashboard
**File:** `src/app/(frontend)/dashboard/user/page.tsx`
**Type:** Server Component
**Has Metadata:** Should have
**Has loading.tsx:** ❌ Missing
**Has error.tsx:** ❌ Missing
**Layout:** ✓ `src/app/(frontend)/dashboard/layout.tsx`

### `/dashboard/user/comments` - User Comments Management
**File:** `src/app/(frontend)/dashboard/user/comments/page.tsx`
**Type:** Server Component
**Has Metadata:** Should have
**Has loading.tsx:** ❌ Missing
**Has error.tsx:** ❌ Missing
**Layout:** ✓ `src/app/(frontend)/dashboard/layout.tsx`

### `/dashboard/user/my-comments` - User's Own Comments
**File:** `src/app/(frontend)/dashboard/user/my-comments/page.tsx`
**Type:** Server Component
**Has Metadata:** Should have
**Has loading.tsx:** ❌ Missing
**Has error.tsx:** ❌ Missing
**Layout:** ✓ `src/app/(frontend)/dashboard/layout.tsx`

---

## Editor Interface (`/(frontend)/editor/`)

### `/editor` - Editor Dashboard
**File:** `src/app/(frontend)/editor/page.tsx`
**Type:** Server Component
**Has Metadata:** Should have
**Has loading.tsx:** ✓ `src/app/(frontend)/editor/loading.tsx`
**Has error.tsx:** ❌ Missing
**Layout:** ✓ `src/app/(frontend)/editor/layout.tsx`

### `/editor/queue` - Content Moderation Queue
**File:** `src/app/(frontend)/editor/queue/page.tsx`
**Type:** Server Component
**Has Metadata:** Should have
**Has loading.tsx:** ✓ `src/app/(frontend)/editor/queue/loading.tsx`
**Has error.tsx:** ❌ Missing
**Layout:** ✓ `src/app/(frontend)/editor/layout.tsx`

### `/editor/content` - Content Management
**File:** `src/app/(frontend)/editor/content/page.tsx`
**Type:** Server Component
**Has Metadata:** Should have
**Has loading.tsx:** ✓ `src/app/(frontend)/editor/content/loading.tsx`
**Has error.tsx:** ❌ Missing
**Layout:** ✓ `src/app/(frontend)/editor/layout.tsx`

### `/editor/posts/create` - Create Post
**File:** `src/app/(frontend)/editor/posts/create/page.tsx`
**Type:** Client Component (form)
**Has Metadata:** Should have
**Has loading.tsx:** ❌ Missing
**Has error.tsx:** ❌ Missing
**Layout:** ✓ `src/app/(frontend)/editor/layout.tsx`

### `/editor/posts/[id]/edit` - Edit Post
**File:** `src/app/(frontend)/editor/posts/[id]/edit/page.tsx`
**Type:** Client Component (form)
**Has Metadata:** Should have (dynamic)
**Has loading.tsx:** ❌ Missing
**Has error.tsx:** ❌ Missing
**Has not-found.tsx:** ❌ Missing (should have for invalid IDs)
**Layout:** ✓ `src/app/(frontend)/editor/layout.tsx`

### `/editor/media` - Media Library
**File:** `src/app/(frontend)/editor/media/page.tsx`
**Type:** Server Component
**Has Metadata:** Should have
**Has loading.tsx:** ✓ `src/app/(frontend)/editor/media/loading.tsx`
**Has error.tsx:** ❌ Missing
**Layout:** ✓ `src/app/(frontend)/editor/layout.tsx`

### `/editor/categories` - Category Management
**File:** `src/app/(frontend)/editor/categories/page.tsx`
**Type:** Server Component
**Has Metadata:** Should have
**Has loading.tsx:** ✓ `src/app/(frontend)/editor/categories/loading.tsx`
**Has error.tsx:** ❌ Missing
**Layout:** ✓ `src/app/(frontend)/editor/layout.tsx`

### `/editor/templates` - Template Management
**File:** `src/app/(frontend)/editor/templates/page.tsx`
**Type:** Server Component
**Has Metadata:** Should have
**Has loading.tsx:** ✓ `src/app/(frontend)/editor/templates/loading.tsx`
**Has error.tsx:** ❌ Missing
**Layout:** ✓ `src/app/(frontend)/editor/layout.tsx`

### `/editor/templates/create` - Create Template
**File:** `src/app/(frontend)/editor/templates/create/page.tsx`
**Type:** Client Component (form)
**Has Metadata:** Should have
**Has loading.tsx:** ❌ Missing
**Has error.tsx:** ❌ Missing
**Layout:** ✓ `src/app/(frontend)/editor/layout.tsx`

### `/editor/templates/[id]/edit` - Edit Template
**File:** `src/app/(frontend)/editor/templates/[id]/edit/page.tsx`
**Type:** Client Component (form)
**Has Metadata:** Should have (dynamic)
**Has loading.tsx:** ❌ Missing
**Has error.tsx:** ❌ Missing
**Has not-found.tsx:** ❌ Missing (should have for invalid IDs)
**Layout:** ✓ `src/app/(frontend)/editor/layout.tsx`

### `/editor/newsletter` - Newsletter Management
**File:** `src/app/(frontend)/editor/newsletter/page.tsx`
**Type:** Server Component
**Has Metadata:** Should have
**Has loading.tsx:** ✓ `src/app/(frontend)/editor/newsletter/loading.tsx`
**Has error.tsx:** ❌ Missing
**Layout:** ✓ `src/app/(frontend)/editor/layout.tsx`

### `/editor/newsletter/compose` - Compose Newsletter
**File:** `src/app/(frontend)/editor/newsletter/compose/page.tsx`
**Type:** Client Component (form)
**Has Metadata:** Should have
**Has loading.tsx:** ❌ Missing
**Has error.tsx:** ❌ Missing
**Layout:** ✓ `src/app/(frontend)/editor/layout.tsx`

### `/editor/newsletter/[id]` - View Newsletter
**File:** `src/app/(frontend)/editor/newsletter/[id]/page.tsx`
**Type:** Server Component
**Has Metadata:** Should have (dynamic)
**Has loading.tsx:** ❌ Missing
**Has error.tsx:** ❌ Missing
**Has not-found.tsx:** ❌ Missing (should have for invalid IDs)
**Layout:** ✓ `src/app/(frontend)/editor/layout.tsx`

### `/editor/newsletter/subscribers` - Subscriber Management
**File:** `src/app/(frontend)/editor/newsletter/subscribers/page.tsx`
**Type:** Server Component
**Has Metadata:** Should have
**Has loading.tsx:** ❌ Missing
**Has error.tsx:** ❌ Missing
**Layout:** ✓ `src/app/(frontend)/editor/layout.tsx`

### `/editor/analytics` - Analytics Dashboard
**File:** `src/app/(frontend)/editor/analytics/page.tsx`
**Type:** Server Component
**Has Metadata:** Should have
**Has loading.tsx:** ✓ `src/app/(frontend)/editor/analytics/loading.tsx`
**Has error.tsx:** ❌ Missing
**Layout:** ✓ `src/app/(frontend)/editor/layout.tsx`

### `/editor/activity` - Activity Log
**File:** `src/app/(frontend)/editor/activity/page.tsx`
**Type:** Server Component
**Has Metadata:** Should have
**Has loading.tsx:** ✓ `src/app/(frontend)/editor/activity/loading.tsx`
**Has error.tsx:** ❌ Missing
**Layout:** ✓ `src/app/(frontend)/editor/layout.tsx`

### `/editor/settings` - Editor Settings
**File:** `src/app/(frontend)/editor/settings/page.tsx`
**Type:** Client Component (form)
**Has Metadata:** Should have
**Has loading.tsx:** ✓ `src/app/(frontend)/editor/settings/loading.tsx`
**Has error.tsx:** ❌ Missing
**Layout:** ✓ `src/app/(frontend)/editor/layout.tsx`

### `/editor/profile` - Editor Profile
**File:** `src/app/(frontend)/editor/profile/page.tsx`
**Type:** Client Component (form)
**Has Metadata:** Should have
**Has loading.tsx:** ❌ Missing
**Has error.tsx:** ❌ Missing
**Layout:** ✓ `src/app/(frontend)/editor/layout.tsx`

---

## Contributor Interface (`/contributor/`)

### `/contributor` - Contributor Dashboard
**File:** `src/app/contributor/page.tsx`
**Type:** Server Component
**Has Metadata:** Should have
**Has loading.tsx:** ✓ `src/app/contributor/loading.tsx`
**Has error.tsx:** ✓ `src/app/contributor/error.tsx`
**Layout:** ✓ `src/app/contributor/layout.tsx`

### `/contributor/create` - Create Content
**File:** `src/app/contributor/create/page.tsx`
**Type:** Client Component (form)
**Has Metadata:** Should have
**Has loading.tsx:** ❌ Missing
**Has error.tsx:** ✓ (inherited from parent)
**Layout:** ✓ `src/app/contributor/layout.tsx`

### `/contributor/drafts` - Draft Posts
**File:** `src/app/contributor/drafts/page.tsx`
**Type:** Server Component
**Has Metadata:** Should have
**Has loading.tsx:** ✓ `src/app/contributor/drafts/loading.tsx`
**Has error.tsx:** ✓ (inherited from parent)
**Layout:** ✓ `src/app/contributor/layout.tsx`

### `/contributor/edit/[id]` - Edit Draft
**File:** `src/app/contributor/edit/[id]/page.tsx`
**Type:** Client Component (form)
**Has Metadata:** Should have (dynamic)
**Has loading.tsx:** ❌ Missing
**Has error.tsx:** ✓ (inherited from parent)
**Has not-found.tsx:** ❌ Missing (should have for invalid IDs)
**Layout:** ✓ `src/app/contributor/layout.tsx`

### `/contributor/submissions` - Submitted Posts
**File:** `src/app/contributor/submissions/page.tsx`
**Type:** Server Component
**Has Metadata:** Should have
**Has loading.tsx:** ✓ `src/app/contributor/submissions/loading.tsx`
**Has error.tsx:** ✓ (inherited from parent)
**Layout:** ✓ `src/app/contributor/layout.tsx`

### `/contributor/feedback` - Feedback Center
**File:** `src/app/contributor/feedback/page.tsx`
**Type:** Server Component
**Has Metadata:** Should have
**Has loading.tsx:** ✓ `src/app/contributor/feedback/loading.tsx`
**Has error.tsx:** ✓ (inherited from parent)
**Layout:** ✓ `src/app/contributor/layout.tsx`

### `/contributor/templates` - Content Templates
**File:** `src/app/contributor/templates/page.tsx`
**Type:** Server Component
**Has Metadata:** Should have
**Has loading.tsx:** ❌ Missing
**Has error.tsx:** ✓ (inherited from parent)
**Layout:** ✓ `src/app/contributor/layout.tsx`

### `/contributor/profile` - Contributor Profile
**File:** `src/app/contributor/profile/page.tsx`
**Type:** Client Component (form)
**Has Metadata:** Should have
**Has loading.tsx:** ❌ Missing
**Has error.tsx:** ✓ (inherited from parent)
**Layout:** ✓ `src/app/contributor/layout.tsx`

---

## Admin Dashboard (`/admin-dashboard/`)

### `/admin-dashboard` - Admin Overview
**File:** `src/app/admin-dashboard/page.tsx`
**Type:** Server Component
**Has Metadata:** Should have
**Has loading.tsx:** ✓ `src/app/admin-dashboard/loading.tsx`
**Has error.tsx:** ✓ `src/app/admin-dashboard/error.tsx`
**Layout:** ✓ `src/app/admin-dashboard/layout.tsx`

### `/admin-dashboard/users` - User Management
**File:** `src/app/admin-dashboard/users/page.tsx`
**Type:** Server Component
**Has Metadata:** Should have
**Has loading.tsx:** ✓ `src/app/admin-dashboard/users/loading.tsx`
**Has error.tsx:** ✓ (inherited from parent)
**Layout:** ✓ `src/app/admin-dashboard/layout.tsx`

### `/admin-dashboard/logs` - System Logs
**File:** `src/app/admin-dashboard/logs/page.tsx`
**Type:** Server Component
**Has Metadata:** Should have
**Has loading.tsx:** ✓ `src/app/admin-dashboard/logs/loading.tsx`
**Has error.tsx:** ✓ (inherited from parent)
**Layout:** ✓ `src/app/admin-dashboard/layout.tsx`

### `/admin-dashboard/profile` - Admin Profile
**File:** `src/app/admin-dashboard/profile/page.tsx`
**Type:** Client Component (form)
**Has Metadata:** Should have
**Has loading.tsx:** ❌ Missing
**Has error.tsx:** ✓ (inherited from parent)
**Layout:** ✓ `src/app/admin-dashboard/layout.tsx`

---

## Newsletter Routes (`/(frontend)/newsletter/`)

### `/newsletter/confirm` - Confirm Subscription
**File:** `src/app/(frontend)/newsletter/confirm/page.tsx`
**Type:** Server Component
**Has Metadata:** Should have
**Has loading.tsx:** ❌ Missing
**Has error.tsx:** ❌ Missing
**Layout:** `src/app/(frontend)/layout.tsx` ✓

### `/newsletter/unsubscribe` - Unsubscribe
**File:** `src/app/(frontend)/newsletter/unsubscribe/page.tsx`
**Type:** Server Component
**Has Metadata:** Should have
**Has loading.tsx:** ❌ Missing
**Has error.tsx:** ❌ Missing
**Layout:** `src/app/(frontend)/layout.tsx` ✓

### `/newsletter/preferences` - Update Preferences
**File:** `src/app/(frontend)/newsletter/preferences/page.tsx`
**Type:** Client Component (form)
**Has Metadata:** Should have
**Has loading.tsx:** ❌ Missing
**Has error.tsx:** ❌ Missing
**Layout:** `src/app/(frontend)/layout.tsx` ✓

---

## Payload Admin (`/(payload)/admin/`)

### `/admin/[[...segments]]` - Payload Admin Panel
**File:** `src/app/(payload)/admin/[[...segments]]/page.tsx`
**Type:** Payload Admin (special)
**Has Metadata:** N/A (Payload handles)
**Has loading.tsx:** N/A
**Has error.tsx:** N/A
**Has not-found.tsx:** ✓ `src/app/(payload)/admin/[[...segments]]/not-found.tsx`
**Layout:** ✓ `src/app/(payload)/layout.tsx`

---

## Summary of Issues

### Missing loading.tsx (High Priority)
1. All auth pages (login, register, set-password)
2. Landing page `/`
3. `/search`
4. `/profile/[id]`
5. `/posts/page/[pageNumber]`
6. All dashboard pages (except editor sections)
7. Most editor form pages (create, edit)
8. Most contributor form pages (create, edit, profile)
9. Newsletter pages (confirm, unsubscribe, preferences)
10. Admin profile page

**Total Missing:** ~40 pages

### Missing error.tsx (Medium Priority)
1. All auth pages
2. All public pages (/, /home, /posts, /posts/[slug], /search, /profile/[id], /[slug])
3. All dashboard pages (except contributor and admin-dashboard which have parent error.tsx)
4. All editor pages
5. Newsletter pages

**Total Missing:** ~50 pages (many can inherit from parent)

### Missing not-found.tsx (Medium Priority)
1. `/posts/[slug]` — should handle invalid slugs
2. `/posts/page/[pageNumber]` — should handle invalid page numbers
3. `/profile/[id]` — should handle invalid user IDs
4. `/[slug]` — should handle invalid page slugs
5. `/editor/posts/[id]/edit` — should handle invalid post IDs
6. `/editor/templates/[id]/edit` — should handle invalid template IDs
7. `/editor/newsletter/[id]` — should handle invalid newsletter IDs
8. `/contributor/edit/[id]` — should handle invalid post IDs

**Total Missing:** 8 dynamic routes

### Potential Duplicate Routes
1. `/` vs `/home` — Investigate if both are needed

---

## Recommendations

### Phase 5: Missing Pages
1. **Add loading.tsx to all pages** — Improves perceived performance
2. **Add error.tsx to route groups** — Better error handling (can be at parent level)
3. **Add not-found.tsx to dynamic routes** — Better UX for invalid IDs/slugs
4. **Investigate `/` vs `/home` duplicate** — Remove if redundant
5. **Add metadata to all pages** — Better SEO

### Priority Order
1. **High:** Add loading.tsx to frequently accessed pages (posts, dashboard, editor)
2. **Medium:** Add not-found.tsx to dynamic routes
3. **Medium:** Add error.tsx to route groups (can inherit)
4. **Low:** Add metadata to all pages
5. **Low:** Investigate and remove duplicate routes
