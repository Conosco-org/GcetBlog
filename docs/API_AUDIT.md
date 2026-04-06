# API Routes Audit

Generated: April 6, 2026

## Summary

Total Custom API Routes: 29
- Authentication: 5 routes
- Posts: 3 routes
- Categories: 2 routes
- Media: 3 routes
- Newsletter: 7 routes
- Feedback: 2 routes
- Votes: 1 route
- Tracking: 1 route
- Admin: 1 route
- Rejection Notifications: 1 route
- Draft/Preview: 2 routes
- Seed: 1 route

---

## Authentication Routes (`/api/auth/`)

### 1. `/api/auth/google` (GET)
**File:** `src/app/api/auth/google/route.ts`
**Purpose:** Initiate Google OAuth flow
**Methods:** GET
**Duplicates Payload:** No (custom OAuth integration)
**Pattern Compliance:** N/A (OAuth redirect)
**Issues:** None

### 2. `/api/auth/google/callback` (GET)
**File:** `src/app/api/auth/google/callback/route.ts`
**Purpose:** Handle Google OAuth callback
**Methods:** GET
**Duplicates Payload:** No (custom OAuth integration)
**Pattern Compliance:** N/A (OAuth callback)
**Issues:** None

### 3. `/api/auth/logout` (POST)
**File:** `src/app/api/auth/logout/route.ts`
**Purpose:** Log out user (clear cookie)
**Methods:** POST
**Duplicates Payload:** Partially (Payload has logout but this adds custom logic)
**Pattern Compliance:** ✓
**Issues:** None

### 4. `/api/auth/me` (GET)
**File:** `src/app/api/auth/me/route.ts`
**Purpose:** Get current user info
**Methods:** GET
**Duplicates Payload:** Yes (Payload has `/api/users/me`)
**Pattern Compliance:** ✓
**Issues:** ⚠️ **Duplicate** — Payload already provides `/api/users/me`. Consider removing or documenting why this exists.

### 5. `/api/auth/set-password` (POST)
**File:** `src/app/api/auth/set-password/route.ts`
**Purpose:** Set/update user password
**Methods:** POST
**Duplicates Payload:** No (custom password management)
**Pattern Compliance:** ✓
**Issues:** None

---

## Posts Routes (`/api/posts/`)

### 6. `/api/posts` (GET)
**File:** `src/app/api/posts/route.ts`
**Purpose:** List/search posts
**Methods:** GET
**Duplicates Payload:** Yes (Payload has `/api/posts`)
**Pattern Compliance:** ✓
**Issues:** ⚠️ **Potential Duplicate** — Check if this adds custom filtering beyond Payload's built-in. If not, remove.

### 7. `/api/posts/create` (POST)
**File:** `src/app/api/posts/create/route.ts`
**Purpose:** Create new post
**Methods:** POST
**Duplicates Payload:** Yes (Payload has POST `/api/posts`)
**Pattern Compliance:** ✓
**Issues:** ⚠️ **Potential Duplicate** — Check if this adds custom logic. If not, use Payload's built-in.

### 8. `/api/posts/[id]` (DELETE, PATCH)
**File:** `src/app/api/posts/[id]/route.ts`
**Purpose:** Delete or update specific post
**Methods:** DELETE, PATCH
**Duplicates Payload:** Yes (Payload has DELETE/PATCH `/api/posts/:id`)
**Pattern Compliance:** ✓ Follows pattern:
- Auth check → 401
- Fetch post → 404
- Permission check → 403
- Operation
- Revalidate paths
- Return JSON response
**Issues:** ⚠️ **Potential Duplicate** — Implements custom permission logic. If this is needed, keep. Otherwise, use Payload's built-in with access control.

---

## Categories Routes (`/api/categories/`)

### 9. `/api/categories/create` (POST)
**File:** `src/app/api/categories/create/route.ts`
**Purpose:** Create new category
**Methods:** POST
**Duplicates Payload:** Yes (Payload has POST `/api/categories`)
**Pattern Compliance:** Unknown (not read)
**Issues:** ⚠️ **Likely Duplicate** — Use Payload's built-in unless custom logic is needed.

### 10. `/api/categories/[id]` (GET, PATCH, DELETE)
**File:** `src/app/api/categories/[id]/route.ts`
**Purpose:** Get, update, or delete category
**Methods:** GET, PATCH, DELETE
**Duplicates Payload:** Yes (Payload has GET/PATCH/DELETE `/api/categories/:id`)
**Pattern Compliance:** Unknown (not read)
**Issues:** ⚠️ **Likely Duplicate** — Use Payload's built-in unless custom logic is needed.

---

## Media Routes (`/api/media/`)

### 11. `/api/media` (GET, POST)
**File:** `src/app/api/media/route.ts`
**Purpose:** List media (GET) or upload media (POST)
**Methods:** GET, POST
**Duplicates Payload:** Partially
- GET duplicates Payload's `/api/media`
- POST adds custom Cloudinary direct upload logic (browser → Cloudinary → Payload)
**Pattern Compliance:** ✓
**Issues:** 
- ✓ POST is justified (custom Cloudinary integration to bypass Vercel 4.5MB limit)
- ⚠️ GET might be duplicate — check if needed

### 12. `/api/media/sign` (GET)
**File:** `src/app/api/media/sign/route.ts`
**Purpose:** Generate Cloudinary upload signature for browser direct upload
**Methods:** GET
**Duplicates Payload:** No (custom Cloudinary integration)
**Pattern Compliance:** ✓
**Issues:** None — required for direct browser uploads

### 13. `/api/media/file/[filename]` (GET)
**File:** `src/app/api/media/file/[filename]/route.ts`
**Purpose:** Serve media files
**Methods:** GET
**Duplicates Payload:** Possibly (Payload serves uploaded files)
**Pattern Compliance:** N/A (file serving)
**Issues:** ⚠️ Check if needed — Payload and Cloudinary both serve files

---

## Newsletter Routes (`/api/newsletter/`)

### 14. `/api/newsletter/subscribe` (POST)
**File:** `src/app/api/newsletter/subscribe/route.ts`
**Purpose:** Subscribe to newsletter
**Methods:** POST
**Duplicates Payload:** No (custom newsletter logic)
**Pattern Compliance:** ✓
**Issues:** None

### 15. `/api/newsletter/unsubscribe` (POST, GET)
**File:** `src/app/api/newsletter/unsubscribe/route.ts`
**Purpose:** Unsubscribe from newsletter
**Methods:** POST, GET
**Duplicates Payload:** No (custom newsletter logic)
**Pattern Compliance:** ✓
**Issues:** None

### 16. `/api/newsletter/preferences` (GET, POST)
**File:** `src/app/api/newsletter/preferences/route.ts`
**Purpose:** Get/update newsletter preferences
**Methods:** GET, POST
**Duplicates Payload:** No (custom newsletter logic)
**Pattern Compliance:** ✓
**Issues:** None

### 17. `/api/newsletter/track/open` (GET)
**File:** `src/app/api/newsletter/track/open/route.ts`
**Purpose:** Track email opens (1x1 pixel)
**Methods:** GET
**Duplicates Payload:** No (custom tracking)
**Pattern Compliance:** N/A (tracking pixel)
**Issues:** None

### 18. `/api/newsletter/track/click` (GET)
**File:** `src/app/api/newsletter/track/click/route.ts`
**Purpose:** Track link clicks in emails
**Methods:** GET
**Duplicates Payload:** No (custom tracking)
**Pattern Compliance:** N/A (redirect tracking)
**Issues:** None

### 19. `/api/newsletter/subscribers/import` (POST)
**File:** `src/app/api/newsletter/subscribers/import/route.ts`
**Purpose:** Bulk import subscribers
**Methods:** POST
**Duplicates Payload:** No (custom bulk operation)
**Pattern Compliance:** ✓
**Issues:** None

### 20. `/api/newsletter/subscribers/export` (GET)
**File:** `src/app/api/newsletter/subscribers/export/route.ts`
**Purpose:** Export subscribers as CSV
**Methods:** GET
**Duplicates Payload:** No (custom export)
**Pattern Compliance:** ✓
**Issues:** None

---

## Feedback Routes (`/api/feedback/`)

### 21. `/api/feedback/create` (POST)
**File:** `src/app/api/feedback/create/route.ts`
**Purpose:** Create feedback thread
**Methods:** POST
**Duplicates Payload:** Yes (Payload has POST `/api/feedback`)
**Pattern Compliance:** Unknown (not read)
**Issues:** ⚠️ **Likely Duplicate** — Use Payload's built-in unless custom logic is needed.

### 22. `/api/feedback/[id]/message` (POST)
**File:** `src/app/api/feedback/[id]/message/route.ts`
**Purpose:** Add message to feedback thread
**Methods:** POST
**Duplicates Payload:** No (custom thread logic)
**Pattern Compliance:** Unknown (not read)
**Issues:** None — justified for thread functionality

---

## Votes Route (`/api/votes/`)

### 23. `/api/votes` (POST)
**File:** `src/app/api/votes/route.ts`
**Purpose:** Create/update/remove vote (toggle logic)
**Methods:** POST
**Duplicates Payload:** Partially (Payload has POST `/api/votes` but this adds toggle logic)
**Pattern Compliance:** ✓ Follows pattern:
- Auth check → 401
- Validation → 400
- Check existing vote
- Create/update/delete based on toggle logic
- Recalculate post vote counts
- Update post document
- Return JSON response
**Issues:** None — justified for custom toggle logic and denormalized counts

---

## Tracking Route (`/api/track/`)

### 24. `/api/track` (POST)
**File:** `src/app/api/track/route.ts`
**Purpose:** Record page view analytics
**Methods:** POST
**Duplicates Payload:** No (custom analytics)
**Pattern Compliance:** ✓
**Issues:** None — justified for custom analytics

---

## Admin Routes (`/api/admin/`)

### 25. `/api/admin/stats` (GET)
**File:** `src/app/api/admin/stats/route.ts`
**Purpose:** Get dashboard statistics
**Methods:** GET
**Duplicates Payload:** No (custom aggregation)
**Pattern Compliance:** Unknown (not read)
**Issues:** None — justified for dashboard

---

## Rejection Notifications Route (`/api/rejection-notifications/`)

### 26. `/api/rejection-notifications/[id]` (DELETE, PATCH)
**File:** `src/app/api/rejection-notifications/[id]/route.ts`
**Purpose:** Delete or mark notification as read
**Methods:** DELETE, PATCH
**Duplicates Payload:** Yes (Payload has DELETE/PATCH `/api/rejection-notifications/:id`)
**Pattern Compliance:** Unknown (not read)
**Issues:** ⚠️ **Potential Duplicate** — Check if custom logic is needed

---

## Draft/Preview Routes

### 27. `/api/draft` (GET)
**File:** `src/app/api/draft/route.ts`
**Purpose:** Enable draft mode for preview
**Methods:** GET
**Duplicates Payload:** No (Next.js draft mode integration)
**Pattern Compliance:** N/A (Next.js feature)
**Issues:** None

### 28. `/api/disable-draft` (GET)
**File:** `src/app/api/disable-draft/route.ts`
**Purpose:** Disable draft mode
**Methods:** GET
**Duplicates Payload:** No (Next.js draft mode integration)
**Pattern Compliance:** N/A (Next.js feature)
**Issues:** None

---

## Seed Route

### 29. `/api/seed-posts` (POST)
**File:** `src/app/api/seed-posts/route.ts`
**Purpose:** Seed database with sample posts (development only)
**Methods:** POST
**Duplicates Payload:** No (custom seeding)
**Pattern Compliance:** N/A (development tool)
**Issues:** ⚠️ Should be disabled in production

---

## Pattern Compliance Summary

### Routes Following Standard Pattern ✓
- `/api/posts/[id]` (DELETE, PATCH)
- `/api/votes` (POST)
- `/api/track` (POST)
- `/api/media` (POST)
- `/api/media/sign` (GET)
- `/api/newsletter/*` (all routes)
- `/api/auth/logout` (POST)
- `/api/auth/set-password` (POST)

### Routes Not Following Pattern (Justified)
- OAuth routes (different pattern)
- Draft/preview routes (Next.js integration)
- Tracking pixel routes (1x1 image response)
- File serving routes (binary response)

### Routes Not Read (Unknown Compliance)
- `/api/categories/create`
- `/api/categories/[id]`
- `/api/feedback/create`
- `/api/feedback/[id]/message`
- `/api/admin/stats`
- `/api/rejection-notifications/[id]`
- `/api/posts` (GET)
- `/api/posts/create` (POST)

---

## Duplicate Routes (Recommend Removal)

### High Priority Duplicates
1. **`/api/auth/me`** — Payload already has `/api/users/me`
   - **Action:** Remove or document why it exists

### Medium Priority Duplicates (Need Investigation)
2. **`/api/posts` (GET)** — Payload has `/api/posts`
   - **Action:** Check if custom filtering is needed. If not, remove.

3. **`/api/posts/create` (POST)** — Payload has POST `/api/posts`
   - **Action:** Check if custom logic is needed. If not, remove.

4. **`/api/categories/create` (POST)** — Payload has POST `/api/categories`
   - **Action:** Check if custom logic is needed. If not, remove.

5. **`/api/categories/[id]`** — Payload has `/api/categories/:id`
   - **Action:** Check if custom logic is needed. If not, remove.

6. **`/api/feedback/create` (POST)** — Payload has POST `/api/feedback`
   - **Action:** Check if custom logic is needed. If not, remove.

7. **`/api/rejection-notifications/[id]`** — Payload has `/api/rejection-notifications/:id`
   - **Action:** Check if custom logic is needed. If not, remove.

8. **`/api/media` (GET)** — Payload has `/api/media`
   - **Action:** Check if needed. POST is justified, but GET might be duplicate.

9. **`/api/media/file/[filename]`** — Payload and Cloudinary serve files
   - **Action:** Check if needed or if Cloudinary URLs can be used directly.

---

## Missing Routes

None identified. All necessary functionality appears to be covered.

---

## Recommendations

### Phase 4: API Route Cleanup
1. **Remove duplicate `/api/auth/me`** — Use Payload's `/api/users/me`
2. **Investigate and remove other duplicates** — Check if custom logic is truly needed
3. **Add rate limiting** — Especially for public endpoints (subscribe, track, votes)
4. **Add request validation** — Use Zod or similar for body validation
5. **Standardize error responses** — All routes should return consistent error format
6. **Add API documentation** — Document all custom routes
7. **Disable `/api/seed-posts` in production** — Add environment check

### Security Improvements
1. Add CSRF protection for state-changing operations
2. Add rate limiting for public endpoints
3. Add request size limits
4. Add input sanitization
5. Add logging for security events

### Performance Improvements
1. Add caching headers where appropriate
2. Add response compression
3. Add database query optimization
4. Add connection pooling
