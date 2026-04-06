# Collection Audit Report

Generated: April 6, 2026

## Summary

Total Collections: 15
- AdminLogs ✓
- Categories ✓
- Comments ✓
- Feedback ✓
- Media ✓
- NewsletterEvents ✓
- Newsletters ✓
- NewsletterSubscribers ✓
- Pages ✓
- PageViews ✓
- Posts ✓
- RejectionNotifications ✓
- Templates ✓
- Users ✓
- Votes ✓

---

## 1. Posts Collection

**Slug:** `posts`

**Fields Present:**
- title (text, required)
- slug (text, auto-generated)
- heroImage (upload → media)
- content (richText, lexical editor)
- relatedPosts (relationship → posts, hasMany)
- categories (relationship → categories, hasMany)
- meta (group: title, description, image)
- tags (json, stored as string[])
- featuredFrom (date)
- featuredUntil (date)
- voteScore (number, default 0, readOnly)
- likesCount (number, default 0, readOnly)
- publishedAt (date)
- authors (relationship → users, hasMany)
- populatedAuthors (array, hidden, auto-populated)
- editorFeedback (textarea)
- reviewStatus (select: draft, pending_review, requesting_changes, approved, rejected)
- submittedForReviewAt (date, readOnly)

**Missing Fields:**
- ❌ excerpt (text) — short summary for cards/previews
- ❌ readTime (number) — estimated reading time in minutes
- ❌ viewCount (number) — denormalized from PageViews
- ❌ commentCount (number) — denormalized from Comments
- ❌ featuredImage (relationship → media) — currently uses heroImage, should be consistent naming

**Access Control:**
- create: `isAdminOrEditor`
- delete: `contributorOwnNotPublished`
- read: `publicOrAuthenticated`
- update: `contributorOwn`

**Hooks:**
- afterChange: `revalidatePost`
- afterRead: `populateAuthors`
- afterDelete: `revalidateDelete`
- beforeValidate: meta description length validation

**Issues:**
- ✓ Has all required reviewStatus values
- ✓ Has versioning enabled (drafts with autosave)
- ⚠️ Missing denormalized counts (viewCount, commentCount) for performance
- ⚠️ Missing excerpt field for better previews
- ⚠️ Missing readTime calculation

**Indexes:** None explicitly defined (should add for performance)

---

## 2. Users Collection

**Slug:** `users`

**Fields Present:**
- name (text, required)
- email (email, required, from auth)
- password (from auth)
- role (select: contributor, editor, admin)
- isAdmin (checkbox, default false)
- canManageAdmins (checkbox, default false)
- bio (textarea)
- avatar (upload → media)
- department (text)
- year (text)
- authProvider (select: local, google, both, readOnly)
- googleSubId (text, unique, readOnly)
- socialLinks (group: twitter, linkedin, github, website)
- newsletterOptIn (checkbox, default false)
- newsletterFrequency (select: daily, weekly, monthly)
- newsletterCategories (relationship → categories, hasMany)

**Missing Fields:**
- ❌ lastLoginAt (date) — track user activity
- ❌ isActive (checkbox) — soft delete/ban users
- ❌ createdAt (auto from timestamps: true) ✓
- ❌ updatedAt (auto from timestamps: true) ✓

**Access Control:**
- admin: `isAdminAccess` (users with isAdmin flag)
- create: `isAuthenticated`
- delete: `isAdminAccess`
- read: `adminOrSelf`
- update: `adminOrSelf`

**Hooks:**
- beforeChange: Upgrade authProvider from 'google' to 'both' when password is set

**Issues:**
- ✓ Has timestamps enabled
- ⚠️ Missing lastLoginAt tracking
- ⚠️ Missing isActive flag for soft deletes
- ✓ Auth provider logic is sound

**Indexes:** None explicitly defined

---

## 3. Comments Collection

**Slug:** `comments`

**Fields Present:**
- post (relationship → posts, required)
- author (relationship → users)
- authorName (text, for anonymous)
- authorEmail (email, for anonymous)
- content (textarea, required, 3-1000 chars)
- status (select: pending, approved, rejected, spam, default pending)
- parent (relationship → comments, for threading)
- moderatorNotes (textarea, editor-only)
- moderatedBy (relationship → users, readOnly)
- moderatedAt (date, readOnly)
- spamType (select: commercial, malicious, off-topic, abusive, bot-generated)
- rejectionReason (select: violates guidelines, spam, off-topic, inappropriate language, duplicate, other)
- rejectionReasonCustom (textarea)
- contentModified (checkbox, default false, readOnly)
- revisionHistory (array with originalContent, modifiedBy, modifiedAt, reason)
- ipAddress (text, readOnly, editor-only)
- userAgent (text, readOnly, editor-only)
- reportedBy (relationship → users)
- reportReason (textarea)
- reportedAt (date, readOnly)
- reportResolvedAt (date, readOnly, editor-only)
- reportResolutionAction (select: no-action, approved, rejected, spam)

**Missing Fields:**
- ✓ All required fields present

**Access Control:**
- read: Complex (editors see all, users see own + approved + reported by them, public sees approved only)
- create: `anyone` (true)
- update: `isAdminOrEditor`
- delete: `isAdminOrEditor`

**Hooks:**
- beforeChange: Auto-approve editor comments, set IP/userAgent, set author from req.user

**Issues:**
- ✓ Comprehensive moderation system
- ✓ Reporting system implemented
- ✓ Revision history tracking
- ✓ Has indexes for performance (status, post, post+status)

**Indexes:** ✓ Defined (status, post, post+status)

---

## 4. Categories Collection

**Slug:** `categories`

**Fields Present:**
- title (text, required)
- slug (text, auto-generated)

**Missing Fields:**
- ❌ description (textarea) — category description
- ❌ postCount (number, default 0) — denormalized count
- ❌ isActive (checkbox, default true) — soft delete

**Access Control:**
- create: `isAdminOrEditor`
- delete: `isAdminOrEditor`
- read: `anyone`
- update: `isAdminOrEditor`

**Hooks:** None

**Issues:**
- ⚠️ Very minimal, missing description
- ⚠️ Missing postCount for performance
- ⚠️ Missing isActive flag

**Indexes:** None

---

## 5. Media Collection

**Slug:** `media`

**Fields Present:**
- alt (text)
- caption (richText)
- cloudinaryUrl (text)
- filename (auto from upload)
- mimeType (auto from upload)
- filesize (auto from upload)
- width (auto from upload)
- height (auto from upload)
- sizes (auto from upload config)

**Missing Fields:**
- ❌ uploadedBy (relationship → users) — track who uploaded

**Access Control:**
- create: `isAuthenticated` (contributors need to upload featured images)
- delete: `isAdminOrEditor`
- read: `anyone`
- update: `isAdminOrEditor`

**Hooks:**
- beforeChange: `uploadToCloudinary`
- afterRead: `useCloudinaryFallback`

**Issues:**
- ✓ Cloudinary integration working
- ⚠️ Missing uploadedBy tracking
- ✓ Has proper image sizes configured

**Indexes:** None

---

## 6. Votes Collection

**Slug:** `votes`

**Fields Present:**
- post (relationship → posts, required, indexed)
- user (relationship → users, required, indexed)
- value (number, required, min -1, max 1, indexed)

**Missing Fields:**
- ✓ All required fields present

**Access Control:**
- read: `anyone` (true)
- create: `isAuthenticated`
- update: User can only update own votes
- delete: User can only delete own votes

**Hooks:**
- beforeChange: Auto-set user from req.user
- beforeValidate: Upsert logic (update existing vote instead of creating duplicate)

**Issues:**
- ✓ Proper unique constraint logic via hooks
- ✓ Validation ensures value is 1 or -1
- ⚠️ Should have compound unique index on [post, user] at DB level

**Indexes:** Individual indexes on post, user, value (missing compound index)

---

## 7. PageViews Collection

**Slug:** `page-views`

**Fields Present:**
- path (text, required, indexed)
- post (relationship → posts, indexed)
- postSlug (text, indexed)
- sessionId (text, indexed)
- referrer (text)
- userAgent (text)
- country (text)
- device (select: desktop, mobile, tablet, unknown)
- browser (text)
- viewedAt (date, required, indexed, default now)

**Missing Fields:**
- ❌ ipHash (text) — hashed IP for privacy-compliant tracking
- ❌ readDuration (number) — time spent on page in seconds
- ❌ readPercentage (number) — how far user scrolled (0-100)

**Access Control:**
- read: Editors/admins only
- create: `anyone` (true) — tracked via middleware/API
- update: `false` (immutable)
- delete: Admin only

**Hooks:** None

**Issues:**
- ✓ Has timestamps
- ✓ Has indexes
- ⚠️ Missing engagement metrics (readDuration, readPercentage)
- ⚠️ Missing ipHash for privacy-compliant tracking

**Indexes:** ✓ Defined (path, post, postSlug, sessionId, viewedAt)

---

## 8. AdminLogs Collection

**Slug:** `admin-logs`

**Fields Present:**
- action (select with 22 values including approve_post, reject_post, spam_comment, newsletter_sent, template_created, etc.)
- resourceType (select: posts, comments, users, media, newsletters, newsletter-subscribers, templates)
- resourceId (text, required)
- user (relationship → users, required)
- details (textarea)
- timestamp (date, required)
- ipAddress (text)

**Missing Fields:**
- ✓ All required fields present

**Access Control:**
- read: `isAdminOrEditor`
- create: `isAdminOrEditor`
- update: `false` (immutable)
- delete: `false` (immutable)

**Hooks:** None

**Issues:**
- ✓ Comprehensive action types
- ✓ Immutable (correct for audit logs)
- ✓ Has timestamps

**Indexes:** None (should add for performance on timestamp, user, resourceType)

---

## 9. RejectionNotifications Collection

**Slug:** `rejection-notifications`

**Fields Present:**
- postTitle (text, required)
- contributor (relationship → users, required)
- rejectedBy (relationship → users, required)
- reason (textarea, required)
- originalPostId (text, required)
- isRead (checkbox, default false)

**Missing Fields:**
- ❌ readAt (date) — when notification was read

**Access Control:**
- create: Editor or admin
- read: Editors/admins see all, contributors see own
- update: `false` (read-only after creation)
- delete: Contributors can delete own, editors/admins can delete any

**Hooks:** None

**Issues:**
- ✓ Has timestamps (createdAt available)
- ⚠️ Missing readAt timestamp
- ✓ Proper access control

**Indexes:** None

---

## 10. Templates Collection

**Slug:** `templates`

**Fields Present:**
- name (text, required)
- status (select: draft, published, default draft)
- description (textarea)
- category (select: academic, general, editorial, news, default general)
- contentType (select: news, event, literary, media, tutorial, academic)
- audience (select: all, editor_only, contributor_only, default all)
- content (textarea, required, HTML)
- suggestedTitle (text)
- suggestedTags (json)
- icon (select: 12 icon options, default file-text)
- usageCount (number, default 0, readOnly)
- createdBy (relationship → users, readOnly)

**Missing Fields:**
- ✓ All required fields present (has isPublished via status field)

**Access Control:**
- create: `isAdminOrEditor`
- delete: `isAdminOrEditor`
- read: `isAuthenticated`
- update: `isAdminOrEditor`

**Hooks:**
- beforeChange: Set createdBy on create
- afterChange: Log to AdminLogs (template_created, template_published, template_unpublished, template_updated)
- afterDelete: Log to AdminLogs (template_deleted)

**Issues:**
- ✓ Comprehensive template system
- ✓ Usage tracking
- ✓ Activity logging
- ✓ Has timestamps

**Indexes:** None

---

## 11. Feedback Collection

**Slug:** `feedback`

**Fields Present:**
- title (text, required)
- post (relationship → posts, required)
- contributor (relationship → users, required)
- editor (relationship → users, required)
- type (select: critical, suggestions, praise, questions, required)
- status (select: active, resolved, closed, default active, required)
- messages (array with content, sender, timestamp)

**Missing Fields:**
- ❌ isRead (checkbox) — whether contributor has read the feedback

**Access Control:**
- create: `isAuthenticated`
- delete: `isAuthenticated`
- read: `isAuthenticated`
- update: `isAuthenticated`

**Hooks:** None

**Issues:**
- ✓ Thread-based feedback system
- ⚠️ Missing isRead flag
- ⚠️ Access control too permissive (should be more restrictive)
- ✓ Has timestamps

**Indexes:** None

---

## 12. NewsletterSubscribers Collection

**Slug:** `newsletter-subscribers`

**Fields Present:**
- email (email, required, unique index)
- name (text)
- status (select: pending, active, unsubscribed, bounced, complained, default pending, required)
- source (select: public_form, user_registration, admin_import, api, default public_form, required)
- user (relationship → users)
- categories (relationship → categories, hasMany)
- frequency (select: daily, weekly, monthly, default weekly)
- unsubscribeToken (text, unique index, auto-generated, readOnly)
- confirmedAt (date, readOnly)
- unsubscribedAt (date, readOnly)
- metadata (json)

**Missing Fields:**
- ✓ All required fields present

**Access Control:**
- read: `isAdminOrEditor`
- update: `isAdminOrEditor`
- delete: `isAdminOrEditor`
- create: `anyone` (public can subscribe)

**Hooks:**
- beforeChange: Auto-generate unsubscribeToken, set unsubscribedAt when status changes to unsubscribed

**Issues:**
- ✓ Comprehensive subscriber management
- ✓ Has indexes (email unique, unsubscribeToken unique, status+frequency)
- ✓ Double opt-in support (confirmedAt)

**Indexes:** ✓ Defined (email unique, unsubscribeToken unique, email+status, status+frequency)

---

## 13. Newsletters Collection

**Slug:** `newsletters`

**Fields Present:**
- title (text, required)
- subject (text, required)
- previewText (text)
- type (select: manual, auto_digest, required, default manual)
- frequency (select: daily, weekly, monthly, for auto_digest)
- status (select: draft, scheduled, sending, sent, failed, required, default draft)
- scheduledFor (date)
- content (richText, for manual compose)
- posts (relationship → posts, hasMany)
- targetCategories (relationship → categories, hasMany)
- sentAt (date, readOnly)
- sentBy (relationship → users, readOnly)
- testRecipients (text)
- stats (group: totalRecipients, delivered, opened, clicked, bounced, unsubscribed, all numbers default 0, readOnly)
- templateId (text, default 'default')

**Missing Fields:**
- ✓ All required fields present

**Access Control:**
- read: `isAdminOrEditor`
- create: `isAdminOrEditor`
- update: `isAdminOrEditor`
- delete: `isAdminOrEditor`

**Hooks:** None

**Issues:**
- ✓ Comprehensive newsletter system
- ✓ Has versioning (drafts with autosave)
- ✓ Stats tracking
- ✓ Has timestamps

**Indexes:** None

---

## 14. NewsletterEvents Collection

**Slug:** `newsletter-events`

**Fields Present:**
- newsletter (relationship → newsletters, required, indexed)
- subscriber (relationship → newsletter-subscribers, indexed)
- type (select: sent, delivered, opened, clicked, bounced, complained, unsubscribed, required)
- url (text, for click events)
- userAgent (text)
- ipAddress (text)
- timestamp (date, required, default now, readOnly)

**Missing Fields:**
- ✓ All required fields present

**Access Control:**
- read: `isAdminOrEditor`
- create: `anyone` (true) — system-only creation
- update: `false` (immutable)
- delete: `false` (immutable)

**Hooks:** None

**Issues:**
- ✓ Immutable event log (correct)
- ✓ Has indexes (newsletter+type, subscriber+type, newsletter+subscriber+type, timestamp)
- ✓ Has timestamps

**Indexes:** ✓ Defined (newsletter+type, subscriber+type, newsletter+subscriber+type, timestamp)

---

## 15. Pages Collection

**Slug:** `pages`

**Fields Present:**
- title (text, required)
- hero (group with type and richText)
- layout (blocks: CallToAction, Content, MediaBlock, Archive, FormBlock, required)
- meta (group: title, description, image)
- publishedAt (date)
- slug (text, auto-generated)

**Missing Fields:**
- ✓ All required fields present for static pages

**Access Control:**
- create: `isAdminOrEditor`
- delete: `isAdminOrEditor`
- read: `publicOrAuthenticated`
- update: `isAdminOrEditor`

**Hooks:**
- afterChange: `revalidatePage`
- beforeChange: `populatePublishedAt`
- afterDelete: `revalidateDelete`
- beforeValidate: meta description length validation

**Issues:**
- ✓ Has versioning (drafts with autosave, schedule publish)
- ✓ Has revalidation hooks
- ✓ Meta description validation

**Indexes:** None

---

## Access Control Summary

### Existing Access Files

From `src/access/`:

1. **adminOrSelf.ts** — Admins see all, users see only their own record
2. **anyone.ts** — Always returns true (public access)
3. **canManageAdminsAccess.ts** — Only users with canManageAdmins flag
4. **contributorOwn.ts** — Editors/admins see all, contributors see own content
5. **contributorOwnNotPublished.ts** — Same as above + blocks deleting published posts
6. **editorOnly.ts** — Only users with role === 'editor'
7. **isAdmin.ts** — Only users with role === 'admin'
8. **isAdminAccess.ts** — Only users with isAdmin flag === true
9. **isAdminOrEditor.ts** — Users with role === 'admin' OR role === 'editor'
10. **isAuthenticated.ts** — Any logged-in user
11. **publicOrAuthenticated.ts** — Published content is public, drafts require auth

### Duplicates Identified

**isAdmin.ts vs isAdminAccess.ts:**
- `isAdmin.ts` checks `role === 'admin'`
- `isAdminAccess.ts` checks `isAdmin === true` (flag)
- These are NOT duplicates — they check different fields
- `isAdmin.ts` checks the role field
- `isAdminAccess.ts` checks the isAdmin flag (for user management permissions)
- **Keep both** — they serve different purposes

### Missing Patterns

None identified. The current set covers all needed patterns.

### Canonical Set (Final)

**Keep all 11 files:**
1. adminOrSelf.ts
2. anyone.ts
3. canManageAdminsAccess.ts
4. contributorOwn.ts
5. contributorOwnNotPublished.ts
6. editorOnly.ts
7. isAdmin.ts
8. isAdminAccess.ts
9. isAdminOrEditor.ts
10. isAuthenticated.ts
11. publicOrAuthenticated.ts

**Delete:** None

**Merge:** None

**Create:** None needed

---

## Summary of Issues

### Critical Issues
None

### High Priority
1. **Posts** — Missing excerpt, readTime, viewCount, commentCount
2. **Users** — Missing lastLoginAt, isActive
3. **Categories** — Missing description, postCount, isActive
4. **Media** — Missing uploadedBy
5. **PageViews** — Missing ipHash, readDuration, readPercentage
6. **RejectionNotifications** — Missing readAt
7. **Feedback** — Missing isRead, access control too permissive

### Medium Priority
1. **Votes** — Should have compound unique index [post, user] at DB level
2. **AdminLogs** — Should have indexes on timestamp, user, resourceType
3. **Posts** — Should have indexes for performance
4. **Categories** — Should have indexes
5. **Templates** — Should have indexes

### Low Priority
None

---

## Recommendations

1. **Phase 2** should focus on adding missing fields to collections
2. **Phase 3** should add database indexes for performance
3. **Phase 4** should tighten access control on Feedback collection
4. **Phase 5** should implement denormalized counts (viewCount, commentCount, postCount)
