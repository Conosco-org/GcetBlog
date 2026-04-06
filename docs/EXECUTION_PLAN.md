# Execution Plan for GCET Blog Codebase

Generated: April 6, 2026

This plan outlines all work needed to complete the GCET Blog codebase based on comprehensive audits of collections, API routes, pages, and components.

---

## Phase 2: Data Model Completion

### 2.1 Posts Collection
**File:** `src/collections/Posts/index.ts`

**Add Fields:**
1. `excerpt` (text, maxLength 300) — Short summary for cards/previews
2. `readTime` (number, readOnly) — Estimated reading time in minutes (calculate from content length)
3. `viewCount` (number, default 0, readOnly) — Denormalized from PageViews
4. `commentCount` (number, default 0, readOnly) — Denormalized from Comments

**Add Indexes:**
- `slug` (unique)
- `_status`
- `reviewStatus`
- `publishedAt`
- `categories`
- `voteScore` (for sorting)
- `viewCount` (for sorting)

**Reason:** Improve performance and enable better previews/sorting

---

### 2.2 Users Collection
**File:** `src/collections/Users/index.ts`

**Add Fields:**
1. `lastLoginAt` (date, readOnly) — Track user activity
2. `isActive` (checkbox, default true) — Soft delete/ban users

**Add Hook:**
- `afterLogin` hook to update `lastLoginAt`

**Reason:** Enable user activity tracking and soft deletes

---

### 2.3 Categories Collection
**File:** `src/collections/Categories.ts`

**Add Fields:**
1. `description` (textarea) — Category description for SEO
2. `postCount` (number, default 0, readOnly) — Denormalized count
3. `isActive` (checkbox, default true) — Soft delete

**Add Indexes:**
- `slug` (unique)
- `isActive`

**Reason:** Better SEO and performance

---

### 2.4 Media Collection
**File:** `src/collections/Media.ts`

**Add Fields:**
1. `uploadedBy` (relationship → users, readOnly) — Track who uploaded

**Add Hook:**
- `beforeChange` to set `uploadedBy` from `req.user`

**Reason:** Audit trail for media uploads

---

### 2.5 PageViews Collection
**File:** `src/collections/PageViews/index.ts`

**Add Fields:**
1. `ipHash` (text, indexed) — Hashed IP for privacy-compliant tracking
2. `readDuration` (number) — Time spent on page in seconds
3. `readPercentage` (number) — How far user scrolled (0-100)

**Add Indexes:**
- `ipHash`
- `viewedAt` (already exists)

**Reason:** Better engagement metrics while maintaining privacy

---

### 2.6 RejectionNotifications Collection
**File:** `src/collections/RejectionNotifications/index.ts`

**Add Fields:**
1. `readAt` (date, readOnly) — When notification was read

**Add Hook:**
- Update `readAt` when `isRead` changes to true

**Reason:** Track when notifications are actually read

---

### 2.7 Feedback Collection
**File:** `src/collections/Feedback.ts`

**Add Fields:**
1. `isRead` (checkbox, default false) — Whether contributor has read the feedback

**Update Access Control:**
- read: Contributors see own feedback, editors see all
- create: Editors only
- update: Editors and contributors (contributors can only mark as read)
- delete: Editors only

**Reason:** Better feedback tracking and tighter security

---

### 2.8 Votes Collection
**File:** `src/collections/Votes/index.ts`

**Add Indexes:**
- Compound unique index on `[post, user]` at MongoDB level

**Reason:** Enforce one vote per user per post at database level

---

### 2.9 AdminLogs Collection
**File:** `src/collections/AdminLogs/index.ts`

**Add Indexes:**
- `timestamp` (for sorting)
- `user` (for filtering)
- `resourceType` (for filtering)
- `action` (for filtering)

**Reason:** Improve query performance for logs

---

### 2.10 Templates Collection
**File:** `src/collections/Templates.ts`

**Add Indexes:**
- `status` (for filtering)
- `category` (for filtering)
- `audience` (for filtering)

**Reason:** Improve query performance

---

### 2.11 Newsletters Collection
**File:** `src/collections/Newsletters/index.ts`

**Add Indexes:**
- `status` (for filtering)
- `type` (for filtering)
- `scheduledFor` (for cron jobs)

**Reason:** Improve query performance and cron job efficiency

---

## Phase 3: Access Control Cleanup

**Status:** ✓ No changes needed

All 11 access control files are properly designed and serve distinct purposes:
- adminOrSelf.ts
- anyone.ts
- canManageAdminsAccess.ts
- contributorOwn.ts
- contributorOwnNotPublished.ts
- editorOnly.ts
- isAdmin.ts (checks role field)
- isAdminAccess.ts (checks isAdmin flag)
- isAdminOrEditor.ts
- isAuthenticated.ts
- publicOrAuthenticated.ts

**Action:** None required

---

## Phase 4: API Route Cleanup

### 4.1 Remove Duplicate Routes

**High Priority:**
1. **Delete** `src/app/api/auth/me/route.ts`
   - **Reason:** Payload already provides `/api/users/me`
   - **Action:** Update all imports to use Payload's endpoint

**Medium Priority (Investigate First):**
2. **Investigate** `src/app/api/posts/route.ts` (GET)
   - Check if custom filtering is needed
   - If not, remove and use Payload's `/api/posts`

3. **Investigate** `src/app/api/posts/create/route.ts` (POST)
   - Check if custom logic is needed
   - If not, remove and use Payload's POST `/api/posts`

4. **Investigate** `src/app/api/categories/create/route.ts` (POST)
   - Check if custom logic is needed
   - If not, remove and use Payload's POST `/api/categories`

5. **Investigate** `src/app/api/categories/[id]/route.ts`
   - Check if custom logic is needed
   - If not, remove and use Payload's `/api/categories/:id`

6. **Investigate** `src/app/api/feedback/create/route.ts` (POST)
   - Check if custom logic is needed
   - If not, remove and use Payload's POST `/api/feedback`

7. **Investigate** `src/app/api/rejection-notifications/[id]/route.ts`
   - Check if custom logic is needed
   - If not, remove and use Payload's `/api/rejection-notifications/:id`

8. **Investigate** `src/app/api/media/route.ts` (GET)
   - POST is justified (Cloudinary integration)
   - Check if GET is needed or if Payload's `/api/media` suffices

9. **Investigate** `src/app/api/media/file/[filename]/route.ts`
   - Check if needed or if Cloudinary URLs can be used directly

---

### 4.2 Security Improvements

**Add to all public endpoints:**
1. Rate limiting (especially: subscribe, track, votes)
2. Request size limits
3. Input sanitization
4. CSRF protection for state-changing operations

**Specific Routes:**
- `/api/newsletter/subscribe` — Add rate limiting (max 5/hour per IP)
- `/api/track` — Add rate limiting (max 100/hour per IP)
- `/api/votes` — Add rate limiting (max 50/hour per user)
- `/api/seed-posts` — Add production check (disable in production)

---

### 4.3 Standardization

**All routes should follow this pattern:**
```typescript
// 1. Auth check → 401
// 2. Fetch resource → 404
// 3. Permission check → 403
// 4. Validation → 400
// 5. Operation
// 6. revalidatePaths([...])
// 7. return NextResponse.json({ success: true, data })
// Errors: return NextResponse.json({ success: false, error: message }, { status: N })
```

**Add request validation:**
- Use Zod or similar for body validation
- Validate all inputs before processing

**Standardize error responses:**
```typescript
{
  success: false,
  error: string,
  details?: unknown
}
```

---

## Phase 5: Missing Pages

### 5.1 Add loading.tsx Files (High Priority)

**Auth Pages:**
1. `src/app/(auth)/login/loading.tsx`
2. `src/app/(auth)/register/loading.tsx`
3. `src/app/(auth)/set-password/loading.tsx`

**Public Pages:**
4. `src/app/(frontend)/loading.tsx` (for `/`)
5. `src/app/(frontend)/search/loading.tsx`
6. `src/app/(frontend)/profile/[id]/loading.tsx`
7. `src/app/(frontend)/posts/page/[pageNumber]/loading.tsx`

**Dashboard Pages:**
8. `src/app/(frontend)/dashboard/loading.tsx`
9. `src/app/(frontend)/dashboard/admin/loading.tsx`
10. `src/app/(frontend)/dashboard/editor/loading.tsx`
11. `src/app/(frontend)/dashboard/user/loading.tsx`
12. `src/app/(frontend)/dashboard/user/comments/loading.tsx`
13. `src/app/(frontend)/dashboard/user/my-comments/loading.tsx`

**Editor Pages:**
14. `src/app/(frontend)/editor/posts/create/loading.tsx`
15. `src/app/(frontend)/editor/posts/[id]/edit/loading.tsx`
16. `src/app/(frontend)/editor/templates/create/loading.tsx`
17. `src/app/(frontend)/editor/templates/[id]/edit/loading.tsx`
18. `src/app/(frontend)/editor/newsletter/compose/loading.tsx`
19. `src/app/(frontend)/editor/newsletter/[id]/loading.tsx`
20. `src/app/(frontend)/editor/newsletter/subscribers/loading.tsx`
21. `src/app/(frontend)/editor/profile/loading.tsx`

**Contributor Pages:**
22. `src/app/contributor/create/loading.tsx`
23. `src/app/contributor/edit/[id]/loading.tsx`
24. `src/app/contributor/templates/loading.tsx`
25. `src/app/contributor/profile/loading.tsx`

**Newsletter Pages:**
26. `src/app/(frontend)/newsletter/confirm/loading.tsx`
27. `src/app/(frontend)/newsletter/unsubscribe/loading.tsx`
28. `src/app/(frontend)/newsletter/preferences/loading.tsx`

**Admin Pages:**
29. `src/app/admin-dashboard/profile/loading.tsx`

**Total:** 29 loading.tsx files

**Template:**
```typescript
import { PageSkeleton } from '@/components/base/PageSkeleton'

export default function Loading() {
  return <PageSkeleton />
}
```

---

### 5.2 Add not-found.tsx Files (Medium Priority)

**Dynamic Routes:**
1. `src/app/(frontend)/posts/[slug]/not-found.tsx`
2. `src/app/(frontend)/posts/page/[pageNumber]/not-found.tsx`
3. `src/app/(frontend)/profile/[id]/not-found.tsx`
4. `src/app/(frontend)/[slug]/not-found.tsx`
5. `src/app/(frontend)/editor/posts/[id]/edit/not-found.tsx`
6. `src/app/(frontend)/editor/templates/[id]/edit/not-found.tsx`
7. `src/app/(frontend)/editor/newsletter/[id]/not-found.tsx`
8. `src/app/contributor/edit/[id]/not-found.tsx`

**Total:** 8 not-found.tsx files

**Template:**
```typescript
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center">
      <h2 className="text-2xl font-bold">Not Found</h2>
      <p className="mt-2 text-muted-foreground">Could not find the requested resource</p>
      <Button asChild className="mt-4">
        <Link href="/">Go Home</Link>
      </Button>
    </div>
  )
}
```

---

### 5.3 Add error.tsx Files (Medium Priority)

**Route Groups (can inherit):**
1. `src/app/(frontend)/error.tsx` (covers all frontend routes)
2. `src/app/(frontend)/editor/error.tsx` (covers all editor routes)
3. `src/app/(frontend)/dashboard/error.tsx` (covers all dashboard routes)
4. `src/app/(auth)/error.tsx` (covers all auth routes)

**Total:** 4 error.tsx files (covers ~50 pages via inheritance)

**Template:**
```typescript
'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center">
      <h2 className="text-2xl font-bold">Something went wrong!</h2>
      <p className="mt-2 text-muted-foreground">{error.message}</p>
      <Button onClick={reset} className="mt-4">
        Try again
      </Button>
    </div>
  )
}
```

---

### 5.4 Add Metadata (Low Priority)

**All pages should have:**
```typescript
export const metadata: Metadata = {
  title: 'Page Title | GCET Blog',
  description: 'Page description',
}
```

**Dynamic pages should use:**
```typescript
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Fetch data and generate metadata
}
```

---

### 5.5 Investigate Duplicate Routes

**Check if both are needed:**
- `/` (`src/app/(frontend)/page.tsx`)
- `/home` (`src/app/(frontend)/home/page.tsx`)

**Action:** If duplicate, remove `/home` and redirect to `/`

---

## Phase 6: Component Cleanup

### 6.1 Remove Unused Components

**Investigate and remove if unused:**
1. `src/components/Card/index.tsx` — Might be redundant with shadcn card
2. `src/components/ModernCTA/index.tsx` — Might be duplicate of LandingPage/CTASection
3. `src/components/ModernFeatures/index.tsx` — Might be duplicate of LandingPage/FeaturesSection
4. `src/components/AdminUI/CustomNav.tsx` — Check if actually used

**Action:** Grep for usage, remove if unused

---

### 6.2 Add Loading States to Action Buttons

**Components needing loading states:**
1. `src/components/comments/CommentCard.tsx`
2. `src/components/comments/CommentForm/index.tsx`
3. `src/components/comments/BulkActionBar.tsx`
4. `src/components/comments/ModerationDialogs.tsx`
5. `src/components/templates/TemplateSelector.tsx`
6. `src/components/GoogleSignInButton.tsx`
7. `src/components/LogoutButton/index.tsx`
8. `src/components/NewsletterSignup/index.tsx`
9. `src/components/PostComments/index.tsx`
10. `src/components/RichTextEditor/RichTextEditor.tsx`
11. `src/components/VoteButtons/index.tsx`

**Action:** Replace all buttons with `LoadingButton` from `src/components/base/LoadingButton.tsx`

---

### 6.3 Remove `any` Types

**All components should be checked for `any` types and replaced with proper TypeScript types.**

**Priority components:**
- All base components
- All comment components
- All template components
- RichTextEditor

**Action:** Search for `any` type usage and replace with proper types

---

### 6.4 Increase Usage of Base Components

**Use these components more consistently:**
1. `EmptyState` — Use in all empty list views
2. `PageHeader` — Use on all pages
3. `DataTable` — Use for all list views
4. `DataTableSkeleton` — Use in all loading.tsx for lists
5. `PageSkeleton` — Use in all loading.tsx for pages
6. `LoadingButton` — Use for all action buttons
7. `FilterBar` — Use for all filterable lists
8. `SearchInput` — Use for all search interfaces

---

## Phase 7: Mobile Responsiveness

### 7.1 Grid Layouts

**All grids must use:**
```typescript
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-N gap-4"
```

**Check these pages:**
- Posts listing
- Media library
- Template selector
- Dashboard cards
- Analytics cards

---

### 7.2 Tables

**All tables must be wrapped:**
```typescript
<div className="overflow-x-auto">
  <table>...</table>
</div>
```

**Check these pages:**
- Editor queue
- Admin logs
- User management
- Newsletter subscribers
- Analytics tables

---

### 7.3 Buttons

**All buttons must have minimum height:**
```typescript
className="h-11" // 44px minimum for mobile
```

**Check all action buttons throughout the app**

---

### 7.4 Navigation

**All navigation must have mobile drawer:**
- Use `Sheet` component from shadcn/ui
- Check header navigation
- Check dashboard navigation
- Check editor navigation
- Check contributor navigation

---

### 7.5 Typography

**No text-xs on mobile:**
```typescript
className="text-sm sm:text-xs" // text-sm minimum on mobile
```

**Check all text throughout the app**

---

## Phase 8: Final Verification

### 8.1 Lint
```bash
pnpm lint
```
**Expected:** 0 errors, 0 warnings

---

### 8.2 Type Check
```bash
pnpm generate:types
npx tsc --noEmit
```
**Expected:** 0 errors

---

### 8.3 Build
```bash
pnpm build
```
**Expected:** Successful build, all pages generated

---

### 8.4 Test Critical Paths

**Manual testing:**
1. User registration and login
2. Contributor post creation and submission
3. Editor post approval/rejection
4. Comment posting and moderation
5. Newsletter subscription
6. Vote on posts
7. Template usage
8. Media upload
9. Analytics tracking
10. Admin user management

---

## Summary

**Total Work Items:**
- Phase 2: 11 collection updates (add 20+ fields, 30+ indexes)
- Phase 3: 0 changes (access control is good)
- Phase 4: 9 route investigations, security improvements
- Phase 5: 29 loading.tsx, 8 not-found.tsx, 4 error.tsx files
- Phase 6: 4 component removals, 11 loading state additions, type cleanup
- Phase 7: Mobile responsiveness checks across all pages
- Phase 8: Lint, type check, build, manual testing

**Estimated Effort:**
- Phase 2: 2-3 days
- Phase 3: 0 days
- Phase 4: 1-2 days
- Phase 5: 1 day
- Phase 6: 1 day
- Phase 7: 1-2 days
- Phase 8: 1 day

**Total: 7-10 days of development work**

---

## Next Steps

1. Review this plan with the team
2. Prioritize phases based on business needs
3. Create tickets for each phase
4. Execute phases in order
5. Test thoroughly after each phase
6. Deploy to staging for QA
7. Deploy to production

---

**End of Execution Plan**
