# Component Audit Report

Generated: April 6, 2026

## Summary

Total Non-UI Components: 58 files
- Base components: 9 files ✓ (reusable utilities)
- Admin components: 5 files
- Landing page components: 7 files
- Comment components: 5 files
- Template components: 3 files
- Media components: 3 files
- Other components: 26 files

---

## Base Components (`src/components/base/`) ✓

These are well-designed reusable components that should be used throughout the app.

### 1. DataTable.tsx
**Purpose:** Reusable data table component
**Has Props Interface:** ✓
**Uses `any` Types:** Need to check
**Imported Anywhere:** Should be used in all list views
**Has Loading States:** N/A (display component)
**Status:** ✓ Keep and use

### 2. DataTablePagination.tsx
**Purpose:** Pagination controls for DataTable
**Has Props Interface:** ✓
**Uses `any` Types:** Need to check
**Imported Anywhere:** Used with DataTable
**Has Loading States:** N/A
**Status:** ✓ Keep

### 3. DataTableSkeleton.tsx
**Purpose:** Loading skeleton for DataTable
**Has Props Interface:** ✓
**Uses `any` Types:** Unlikely
**Imported Anywhere:** Should be used in all list views
**Has Loading States:** N/A (is a loading state)
**Status:** ✓ Keep and use more

### 4. EmptyState.tsx
**Purpose:** Empty state placeholder
**Has Props Interface:** ✓
**Uses `any` Types:** Unlikely
**Imported Anywhere:** Should be used in all list views
**Has Loading States:** N/A
**Status:** ✓ Keep and use more

### 5. FilterBar.tsx
**Purpose:** Filter controls for lists
**Has Props Interface:** ✓
**Uses `any` Types:** Need to check
**Imported Anywhere:** Should be used in list views
**Has Loading States:** N/A
**Status:** ✓ Keep and use

### 6. LoadingButton.tsx
**Purpose:** Button with loading state
**Has Props Interface:** ✓
**Uses `any` Types:** Unlikely
**Imported Anywhere:** Should be used for all action buttons
**Has Loading States:** ✓ (is a loading button)
**Status:** ✓ Keep and use everywhere

### 7. PageHeader.tsx
**Purpose:** Consistent page header
**Has Props Interface:** ✓
**Uses `any` Types:** Unlikely
**Imported Anywhere:** Should be used on all pages
**Has Loading States:** N/A
**Status:** ✓ Keep and use more

### 8. PageSkeleton.tsx
**Purpose:** Loading skeleton for pages
**Has Props Interface:** ✓
**Uses `any` Types:** Unlikely
**Imported Anywhere:** Should be used in loading.tsx files
**Has Loading States:** N/A (is a loading state)
**Status:** ✓ Keep and use in all loading.tsx

### 9. SearchInput.tsx
**Purpose:** Search input field
**Has Props Interface:** ✓
**Uses `any` Types:** Need to check
**Imported Anywhere:** Should be used in search/filter interfaces
**Has Loading States:** N/A
**Status:** ✓ Keep and use

---

## Admin Components (`src/components/AdminUI/`)

### 10. CustomDashboard.tsx
**Purpose:** Custom Payload admin dashboard
**Has Props Interface:** Check
**Uses `any` Types:** Likely (Payload integration)
**Imported Anywhere:** ✓ Used in payload.config.ts
**Has Loading States:** Check
**Status:** ✓ Keep (Payload customization)

### 11. CustomLogo.tsx
**Purpose:** Custom logo for Payload admin
**Has Props Interface:** Check
**Uses `any` Types:** Unlikely
**Imported Anywhere:** ✓ Used in payload.config.ts
**Has Loading States:** N/A
**Status:** ✓ Keep (Payload customization)

### 12. CustomNav.tsx
**Purpose:** Custom navigation for Payload admin
**Has Props Interface:** Check
**Uses `any` Types:** Likely (Payload integration)
**Imported Anywhere:** Check if used
**Has Loading States:** N/A
**Status:** ⚠️ Check if used (might be unused)

### 13. AdminBar/index.tsx
**Purpose:** Admin bar for frontend
**Has Props Interface:** Check
**Uses `any` Types:** Likely
**Imported Anywhere:** Check
**Has Loading States:** N/A
**Status:** ✓ Keep (admin feature)

### 14. AdminLogout/index.tsx
**Purpose:** Custom logout button for Payload admin
**Has Props Interface:** Check
**Uses `any` Types:** Unlikely
**Imported Anywhere:** ✓ Used in payload.config.ts
**Has Loading States:** Check
**Status:** ✓ Keep (Payload customization)

---

## Landing Page Components (`src/components/LandingPage/`)

### 15-21. Landing Page Sections
**Files:**
- CTASection.tsx
- FeaturedPosts.tsx
- FeaturesSection.tsx
- HeroSection.tsx
- HomePosts.tsx
- RecentPostsSection.tsx
- StatsSection.tsx

**Purpose:** Landing page sections
**Has Props Interface:** ✓ (likely)
**Uses `any` Types:** Need to check
**Imported Anywhere:** ✓ Used in landing page
**Has Loading States:** Need to check
**Status:** ✓ Keep (landing page features)

---

## Comment Components (`src/components/comments/`)

### 22. BulkActionBar.tsx
**Purpose:** Bulk actions for comment moderation
**Has Props Interface:** ✓
**Uses `any` Types:** Need to check
**Imported Anywhere:** ✓ Used in editor content management
**Has Loading States:** Should have (action buttons)
**Status:** ✓ Keep

### 23. CommentCard.tsx
**Purpose:** Individual comment display
**Has Props Interface:** ✓
**Uses `any` Types:** Need to check
**Imported Anywhere:** ✓ Used in comment lists
**Has Loading States:** Should have (action buttons)
**Status:** ✓ Keep

### 24. ModerationDialogs.tsx
**Purpose:** Dialogs for comment moderation
**Has Props Interface:** ✓
**Uses `any` Types:** Need to check
**Imported Anywhere:** ✓ Used in editor content management
**Has Loading States:** Should have (action buttons)
**Status:** ✓ Keep

### 25. CommentForm/index.tsx
**Purpose:** Form for posting comments
**Has Props Interface:** ✓
**Uses `any` Types:** Need to check
**Imported Anywhere:** ✓ Used on post pages
**Has Loading States:** Should have (submit button)
**Status:** ✓ Keep

### 26. CommentList/index.tsx
**Purpose:** List of comments
**Has Props Interface:** ✓
**Uses `any` Types:** Need to check
**Imported Anywhere:** ✓ Used on post pages
**Has Loading States:** Should have
**Status:** ✓ Keep

---

## Template Components (`src/components/templates/`)

### 27. TemplateCard.tsx
**Purpose:** Template preview card
**Has Props Interface:** ✓
**Uses `any` Types:** Need to check
**Imported Anywhere:** ✓ Used in template selector
**Has Loading States:** N/A
**Status:** ✓ Keep

### 28. TemplatePreview.tsx
**Purpose:** Template preview modal
**Has Props Interface:** ✓
**Uses `any` Types:** Need to check
**Imported Anywhere:** ✓ Used in template selector
**Has Loading States:** N/A
**Status:** ✓ Keep

### 29. TemplateSelector.tsx
**Purpose:** Template selection interface
**Has Props Interface:** ✓
**Uses `any` Types:** Need to check
**Imported Anywhere:** ✓ Used in contributor create
**Has Loading States:** Should have
**Status:** ✓ Keep

---

## Media Components (`src/components/Media/`)

### 30. ImageMedia/index.tsx
**Purpose:** Image display component
**Has Props Interface:** ✓
**Uses `any` Types:** Need to check
**Imported Anywhere:** ✓ Used in Media component
**Has Loading States:** Should have
**Status:** ✓ Keep

### 31. VideoMedia/index.tsx
**Purpose:** Video display component
**Has Props Interface:** ✓
**Uses `any` Types:** Need to check
**Imported Anywhere:** ✓ Used in Media component
**Has Loading States:** Should have
**Status:** ✓ Keep

### 32. Media/index.tsx
**Purpose:** Main media component (image/video)
**Has Props Interface:** ✓
**Uses `any` Types:** Need to check
**Imported Anywhere:** ✓ Used throughout app
**Has Loading States:** Should have
**Status:** ✓ Keep

---

## Other Components

### 33. BeforeDashboard/index.tsx
**Purpose:** Payload admin dashboard customization
**Has Props Interface:** Check
**Uses `any` Types:** Likely (Payload integration)
**Imported Anywhere:** ✓ Used in payload.config.ts
**Has Loading States:** N/A
**Status:** ✓ Keep (Payload customization)

### 34. BeforeDashboard/SeedButton/index.tsx
**Purpose:** Seed data button for development
**Has Props Interface:** Check
**Uses `any` Types:** Unlikely
**Imported Anywhere:** ✓ Used in BeforeDashboard
**Has Loading States:** Should have
**Status:** ✓ Keep (development tool)

### 35. BeforeLogin/index.tsx
**Purpose:** Payload admin login customization
**Has Props Interface:** Check
**Uses `any` Types:** Unlikely
**Imported Anywhere:** ✓ Used in payload.config.ts
**Has Loading States:** N/A
**Status:** ✓ Keep (Payload customization)

### 36. Card/index.tsx
**Purpose:** Generic card component
**Has Props Interface:** ✓
**Uses `any` Types:** Need to check
**Imported Anywhere:** Check usage
**Has Loading States:** N/A
**Status:** ⚠️ Check if used (might be redundant with shadcn card)

### 37. CollectionArchive/index.tsx
**Purpose:** Archive block component
**Has Props Interface:** ✓
**Uses `any` Types:** Need to check
**Imported Anywhere:** ✓ Used in blocks
**Has Loading States:** Should have
**Status:** ✓ Keep

### 38. DraftModeBanner.tsx
**Purpose:** Banner for draft mode
**Has Props Interface:** ✓
**Uses `any` Types:** Unlikely
**Imported Anywhere:** Check usage
**Has Loading States:** N/A
**Status:** ✓ Keep (preview feature)

### 39. GlobalSearchBar/index.tsx
**Purpose:** Global search bar
**Has Props Interface:** ✓
**Uses `any` Types:** Need to check
**Imported Anywhere:** Check usage
**Has Loading States:** Should have
**Status:** ✓ Keep

### 40. GoogleSignInButton.tsx
**Purpose:** Google OAuth sign-in button
**Has Props Interface:** ✓
**Uses `any` Types:** Unlikely
**Imported Anywhere:** ✓ Used in login/register
**Has Loading States:** Should have
**Status:** ✓ Keep

### 41. Header/AuthButton.tsx
**Purpose:** Auth button in header
**Has Props Interface:** ✓
**Uses `any` Types:** Need to check
**Imported Anywhere:** ✓ Used in header
**Has Loading States:** N/A
**Status:** ✓ Keep

### 42. InstagramEmbedLoader.tsx
**Purpose:** Instagram embed loader
**Has Props Interface:** ✓
**Uses `any` Types:** Need to check
**Imported Anywhere:** ✓ Used in blocks
**Has Loading States:** Should have
**Status:** ✓ Keep

### 43. Link/index.tsx
**Purpose:** Custom Link component
**Has Props Interface:** ✓
**Uses `any` Types:** Need to check
**Imported Anywhere:** Should be used everywhere
**Has Loading States:** N/A
**Status:** ✓ Keep and use everywhere

### 44. LivePreviewListener/index.tsx
**Purpose:** Payload live preview integration
**Has Props Interface:** Check
**Uses `any` Types:** Likely (Payload integration)
**Imported Anywhere:** Check usage
**Has Loading States:** N/A
**Status:** ✓ Keep (Payload feature)

### 45. Logo/Logo.tsx
**Purpose:** Site logo component
**Has Props Interface:** ✓
**Uses `any` Types:** Unlikely
**Imported Anywhere:** ✓ Used in header
**Has Loading States:** N/A
**Status:** ✓ Keep

### 46. LogoutButton/index.tsx
**Purpose:** Logout button
**Has Props Interface:** ✓
**Uses `any` Types:** Unlikely
**Imported Anywhere:** ✓ Used in navigation
**Has Loading States:** Should have
**Status:** ✓ Keep

### 47. ModernCTA/index.tsx
**Purpose:** Modern CTA component
**Has Props Interface:** ✓
**Uses `any` Types:** Need to check
**Imported Anywhere:** Check usage
**Has Loading States:** N/A
**Status:** ⚠️ Check if used (might be duplicate of LandingPage/CTASection)

### 48. ModernFeatures/index.tsx
**Purpose:** Modern features component
**Has Props Interface:** ✓
**Uses `any` Types:** Need to check
**Imported Anywhere:** Check usage
**Has Loading States:** N/A
**Status:** ⚠️ Check if used (might be duplicate of LandingPage/FeaturesSection)

### 49. NewsletterSignup/index.tsx
**Purpose:** Newsletter signup form
**Has Props Interface:** ✓
**Uses `any` Types:** Need to check
**Imported Anywhere:** ✓ Used in footer/landing
**Has Loading States:** Should have
**Status:** ✓ Keep

### 50. PageRange/index.tsx
**Purpose:** Page range display for pagination
**Has Props Interface:** ✓
**Uses `any` Types:** Unlikely
**Imported Anywhere:** ✓ Used with pagination
**Has Loading States:** N/A
**Status:** ✓ Keep

### 51. PageViewTracker/index.tsx
**Purpose:** Client-side page view tracking
**Has Props Interface:** ✓
**Uses `any` Types:** Unlikely
**Imported Anywhere:** ✓ Used in layouts
**Has Loading States:** N/A
**Status:** ✓ Keep

### 52. Pagination/index.tsx
**Purpose:** Pagination component
**Has Props Interface:** ✓
**Uses `any` Types:** Need to check
**Imported Anywhere:** ✓ Used in list views
**Has Loading States:** N/A
**Status:** ✓ Keep

### 53. PayloadRedirects/index.tsx
**Purpose:** Payload redirects integration
**Has Props Interface:** Check
**Uses `any` Types:** Likely (Payload integration)
**Imported Anywhere:** Check usage
**Has Loading States:** N/A
**Status:** ✓ Keep (Payload feature)

### 54. PostComments/index.tsx
**Purpose:** Post comments section
**Has Props Interface:** ✓
**Uses `any` Types:** Need to check
**Imported Anywhere:** ✓ Used on post pages
**Has Loading States:** Should have
**Status:** ✓ Keep

### 55. RichText/index.tsx
**Purpose:** Rich text renderer
**Has Props Interface:** ✓
**Uses `any` Types:** Need to check
**Imported Anywhere:** ✓ Used throughout app
**Has Loading States:** N/A
**Status:** ✓ Keep

### 56. RichTextEditor/RichTextEditor.tsx
**Purpose:** Rich text editor (Tiptap)
**Has Props Interface:** ✓
**Uses `any` Types:** Likely (Tiptap integration)
**Imported Anywhere:** ✓ Used in forms
**Has Loading States:** Should have
**Status:** ✓ Keep

### 57. ShareButtons/index.tsx
**Purpose:** Social share buttons
**Has Props Interface:** ✓
**Uses `any` Types:** Unlikely
**Imported Anywhere:** ✓ Used on post pages
**Has Loading States:** N/A
**Status:** ✓ Keep

### 58. UserInfo/index.tsx
**Purpose:** User info display
**Has Props Interface:** ✓
**Uses `any` Types:** Need to check
**Imported Anywhere:** Check usage
**Has Loading States:** N/A
**Status:** ✓ Keep

### 59. VoteButtons/index.tsx
**Purpose:** Upvote/downvote buttons
**Has Props Interface:** ✓
**Uses `any` Types:** Need to check
**Imported Anywhere:** ✓ Used on post pages
**Has Loading States:** Should have
**Status:** ✓ Keep

---

## Issues Summary

### Components to Investigate (Potential Duplicates)
1. **Card/index.tsx** — Might be redundant with shadcn card component
2. **ModernCTA/index.tsx** — Might be duplicate of LandingPage/CTASection
3. **ModernFeatures/index.tsx** — Might be duplicate of LandingPage/FeaturesSection
4. **CustomNav.tsx** — Check if actually used

### Components Missing Loading States (High Priority)
Need to check these components for loading states on action buttons:
1. CommentCard.tsx
2. CommentForm/index.tsx
3. BulkActionBar.tsx
4. ModerationDialogs.tsx
5. TemplateSelector.tsx
6. GoogleSignInButton.tsx
7. LogoutButton/index.tsx
8. NewsletterSignup/index.tsx
9. PostComments/index.tsx
10. RichTextEditor/RichTextEditor.tsx
11. VoteButtons/index.tsx

### Components to Check for `any` Types (Medium Priority)
All components should be checked for TypeScript `any` types and replaced with proper types.

### Components Not Imported (Low Priority)
Need to grep for usage of:
1. CustomNav.tsx
2. Card/index.tsx
3. ModernCTA/index.tsx
4. ModernFeatures/index.tsx

---

## Recommendations

### Phase 6: Component Cleanup
1. **Check for unused components** — Remove Card, ModernCTA, ModernFeatures, CustomNav if unused
2. **Add loading states to action buttons** — Use LoadingButton component everywhere
3. **Remove `any` types** — Replace with proper TypeScript types
4. **Increase usage of base components** — Use EmptyState, PageHeader, DataTable more consistently
5. **Add prop interfaces** — Ensure all components have proper TypeScript interfaces
6. **Add component documentation** — Add JSDoc comments to all components

### Priority Order
1. **High:** Add loading states to action buttons (use LoadingButton)
2. **High:** Remove unused components
3. **Medium:** Remove `any` types
4. **Medium:** Increase usage of base components
5. **Low:** Add component documentation
