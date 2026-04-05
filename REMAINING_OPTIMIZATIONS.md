# Remaining Optimizations - Action Items

## Progress So Far ✅

**Completed (20% of total work):**
1. ✅ Removed 23+ console.log statements from:
   - `src/providers/User/index.tsx`
   - `src/jobs/newsletter.ts`
   - `src/services/email/sender.ts`
2. ✅ Created comprehensive optimization plan
3. ✅ Created status tracking documents

## Critical Remaining Work 🔴

### 1. Remove Remaining Console Statements (40+ instances)

**High Priority Files:**
```bash
# Email Providers (Production Code)
src/services/email/providers/smtp.ts - Lines 81, 127
src/services/email/providers/sendgrid.ts - Line 69
src/services/email/providers/resend.ts - Line 82
src/services/email/factory.ts - Line 65

# Auth & User Management
src/providers/Auth/index.tsx - Line 36
src/components/LogoutButton/index.tsx - Line 27
src/components/AdminLogout/index.tsx - Lines 16, 19

# API Routes (Error Handling)
src/app/api/votes/route.ts - Line 105
src/app/api/users/me/route.ts - Line 29
src/app/api/track/route.ts - Line 72
src/app/api/posts/route.ts - Line 152
src/app/api/posts/[id]/route.ts - Lines 114, 200

# Auth Actions
src/app/(auth)/login/actions.ts - Lines 55, 63
src/app/(auth)/register/actions.ts - Line 89

# Components
src/components/RichTextEditor/RichTextEditor.tsx - Line 203
src/components/templates/TemplateSelector.tsx - Line 105
src/components/NewsletterSignup/index.tsx - Line 44
src/components/AdminUI/CustomDashboard.tsx - Line 79

# Collections
src/collections/Templates.ts - Lines 190, 213
src/collections/Posts/index.ts - Line 384 (console.warn for SEO)
src/collections/Pages/index.ts - Line 121 (console.warn for SEO)

# Search
src/search/beforeSync.ts - Line 46

# Blocks
src/blocks/Form/Component.tsx - Line 103
```

**Dev-Only Files (Keep but document):**
```bash
src/services/email/providers/console.ts - Entire file (dev mode only)
src/app/api/seed-posts/route.ts - Line 16 (seed script)
```

### 2. Migrate Deprecated Functions

**Files to Update:**
```typescript
// src/collections/Users/index.ts
// Line 4: Change
import { adminOnly } from '../../access/adminOnly'
// To:
import { isAdminAccess } from '../../access/isAdminAccess'

// Line 14: Change
delete: adminOnly,
// To:
delete: isAdminAccess,
```

```typescript
// src/collections/Posts/index.ts
// Line 15: Change
import { editorOrAdmin } from '../../access/editorOrAdmin'
// To:
import { editorOnly } from '../../access/editorOnly'

// Line 39: Change
create: editorOrAdmin,
// To:
create: editorOnly,
```

**Files to Delete After Migration:**
```bash
src/access/adminOnly.ts
src/access/editorOrAdmin.ts
```

### 3. Fix Type Safety Violations

**Remove @ts-nocheck:**
```typescript
// src/utilities/deepMerge.ts
// Remove lines 1-2:
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

// Add proper types instead
```

**Fix `as any` Casts:**
```typescript
// src/payload.config.ts - Lines 152-172
// Replace all job handler casts:
handler: newsletterDailyDigest as any,
// With proper typing or type assertion
```

### 4. Remove Unused Dependencies

**Edit package.json:**
```json
// Remove these lines:
"@types/escape-html": "^1.0.2",
"@types/estree": "^1.0.8",
"@types/estree-jsx": "^1.0.5",
"@types/json-schema": "^7.0.15",
```

**Then run:**
```bash
pnpm remove @types/escape-html @types/estree @types/estree-jsx @types/json-schema
```

### 5. Add Image Optimizations

**Files Needing Updates:**
```typescript
// Add priority to above-fold images:
<Image priority ... />

// Add lazy loading to below-fold images:
<Image loading="lazy" ... />

// Files:
src/Header/Component.client.tsx - Line 90
src/components/LandingPage/HomePosts.tsx - Lines 78, 131
src/components/LandingPage/HeroSection.tsx - Line 91
src/app/contributor/components/ContributorHeader.tsx - Line 71
src/app/(frontend)/profile/[id]/page.tsx - Lines 103, 230
src/app/(frontend)/editor/posts/create/PostForm.tsx - Line 563
src/app/(frontend)/editor/posts/[id]/edit/PostForm.tsx - Line 574
```

### 6. Complete or Remove TODOs

**TODO Items:**
```typescript
// src/collections/Posts/index.ts:311
// TODO: Add author check when we have proper author relationships
// Either implement or remove this TODO

// src/app/(frontend)/posts/[slug]/actions.ts:159
// TODO: Get the current user from session/context
// Replace mock user with actual user from session

// src/app/(frontend)/editor/newsletter/compose/ComposeForm.tsx:80
// TODO - Call server action
// Implement the server action or remove TODO
```

### 7. Configuration Cleanup

**next.config.js:**
```javascript
// Remove commented example (Line 13)
// Add image optimization:
images: {
  formats: ['image/avif', 'image/webp'],
  minimumCacheTTL: 60,
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
}
```

### 8. Code Quality Fixes

**Duplicate Imports:**
```typescript
// src/components/Card/index.tsx - Line 3
// Remove duplicate useClickableCard import
```

**Standardize Exports:**
- Choose either `export default` or `export const` consistently
- Update all components to follow same pattern

## Quick Win Script

Create a file `scripts/remove-console-logs.sh`:
```bash
#!/bin/bash

# Remove console.log statements (keep console.error in catch blocks for now)
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '/console\.log/d' {} +

# Remove console.warn for SEO (non-critical)
find src/collections -type f -name "*.ts" -exec sed -i '/console\.warn.*SEO/d' {} +

echo "Console.log statements removed. Review changes before committing."
```

## Testing After Each Change

```bash
# 1. Build
npm run build

# 2. Lint
npm run lint

# 3. Type check
npx tsc --noEmit

# 4. Test critical paths manually
```

## Estimated Time Breakdown

| Task | Time | Priority |
|------|------|----------|
| Remove remaining console.logs | 1 hour | 🔴 High |
| Migrate deprecated functions | 15 min | 🔴 High |
| Fix type safety | 1.5 hours | 🔴 High |
| Remove unused deps | 5 min | 🟡 Medium |
| Image optimizations | 30 min | 🟡 Medium |
| Complete TODOs | 45 min | 🟡 Medium |
| Config cleanup | 15 min | 🟠 Low |
| Code quality | 30 min | 🟠 Low |
| Documentation | 30 min | 🟠 Low |
| **Total** | **~5 hours** | |

## Recommendation

**Phase 1 (Critical - Do Now):**
1. Remove all console.logs from production code
2. Migrate deprecated functions
3. Fix critical type safety issues

**Phase 2 (Important - Do Soon):**
4. Remove unused dependencies
5. Add image optimizations
6. Complete or remove TODOs

**Phase 3 (Nice to Have - Do Later):**
7. Configuration cleanup
8. Code quality improvements
9. Documentation updates

## Current Branch Status

- Branch: `refactor/codebase-optimization`
- Commits: 2
- Progress: ~20% complete
- Ready to continue: Yes

## Next Command to Run

```bash
# Continue with console.log removal
git add -A
git commit -m "refactor: remove remaining console statements"

# Then migrate deprecated functions
git add -A
git commit -m "refactor: migrate deprecated access control functions"

# And so on...
```
