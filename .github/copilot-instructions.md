# Copilot Instructions — GCET Blog Platform (Conosco Multi-Tenant SaaS)

## Project Overview

- **Framework**: Next.js 15 (App Router, RSC)
- **CMS**: Payload CMS v3 (embedded — admin panel disabled for end-users)
- **UI**: shadcn/ui + Tailwind CSS + Radix primitives
- **Language**: TypeScript (strict, `no-explicit-any` as error)
- **Auth**: Payload built-in auth + Google OAuth, role-assignment based RBAC
- **Database**: MongoDB (via Payload) with multi-tenant isolation
- **Architecture**: Multi-tenant SaaS — single codebase, shared DB, tenant-scoped data

## Multi-Tenant Architecture

### Tenant Model

One institution = one tenant. All data is scoped by `institution` field.

```
Conosco (platform owner)
├── platform.conosco.in      ← SuperAdmin dashboard (/platform route)
│
├── GCET (tenant)
│   ├── digital.gcet.edu.in  ← Dashboard + public site (path-based routing)
│   └── blog.gcet.edu.in     ← Optional second domain
│
├── JNTU (tenant)
│   └── hub.jntu.ac.in
└── ...
```

### Tenant Isolation (3-layer defense-in-depth)

1. **Access Control** — `institutionField` auto-sets `institution` on create via `beforeChange` hook
2. **Collection Hooks** — `tenantIsolation.ts` auto-injects `{ institution: { equals: tenantId } }` on every find/count/update/delete via `beforeOperation` hook. `afterRead` logs cross-tenant warnings
3. **Query Guard** — `tenantQuery.ts` wrapper functions (`tenantFind`, `tenantCreate`, etc.) for explicit tenant-scoped queries

### Tenant Resolution Flow

```
Browser → hostname (e.g., digital.gcet.edu.in)
  → Edge Middleware reads hostname
  → Calls /api/resolve-tenant?hostname=...  (Node.js, uses Payload)
  → Looks up Institutions.domains[] array
  → Sets x-tenant-id, x-tenant-code, x-tenant-club-scope headers
  → All downstream server components read headers via tenantContext.ts
```

Key files:
- `src/middleware.ts` — Edge middleware, tenant resolution, route protection
- `src/utilities/tenantResolver.ts` — hostname → institution lookup (cached 5min)
- `src/utilities/tenantContext.ts` — Server component helpers (`getCurrentTenant()`)
- `src/hooks/tenantIsolation.ts` — Defense-in-depth collection hooks
- `src/utilities/tenantQuery.ts` — Tenant-scoped Payload query wrappers
- `src/app/api/resolve-tenant/route.ts` — Node.js API endpoint for resolution

### Domain Configuration (Institutions Collection)

```ts
// Each institution has a domains array:
domains: [
  { hostname: 'digital.gcet.edu.in', purpose: 'main', isPrimary: true },
  { hostname: 'blog.gcet.edu.in', purpose: 'blog' },
  { hostname: 'ieee.gcet.edu.in', purpose: 'club', clubScope: 'ieee-club-id' },
]
```

## Role Hierarchy (Content Engine v2 RBAC)

```
superadmin (platform owner — Conosco team)
  └─ institution_admin (college-level admin — full autonomy within tenant)
       ├─ blog_editor    (manage all blog posts, can publish)
       ├─ blog_author    (write drafts, cannot publish)
       ├─ club_admin     (manage specific club: pages, events, gallery)
       ├─ club_editor    (create club content drafts)
       ├─ event_manager  (manage events across all clubs)
       └─ moderator      (moderate comments/feedback)
```

- `superadmin` bypasses ALL checks — platform-level, no institution
- `institution_admin` bypasses all checks WITHIN their institution
- Scoped roles checked against `PERMISSION_MAP` in `src/access/permissions.ts`
- Users have `role: 'superadmin' | 'user'` + `roleAssignments[]` array

### Route Structure

| Route | Purpose | Access |
|---|---|---|
| `/platform/*` | SuperAdmin dashboard (institutions, platform stats) | `role === 'superadmin'` |
| `/user/*` | Unified dashboard for all role holders | Any user with `roleAssignments.length > 0` |
| `/user/posts/*` | Blog post management | `blog_editor`, `blog_author` |
| `/user/clubs/*` | Club management | `club_admin`, `club_editor` |
| `/user/events/*` | Event management | `event_manager`, `club_admin` |
| `/user/users/*` | User management | `institution_admin` |
| `/user/logs/*` | Activity logs | `institution_admin` |
| `/user/newsletter/*` | Newsletter management | `blog_editor` |
| `/(frontend)/*` | Public pages (blog, clubs, events) | Everyone |
| `/(frontend)/clubs/[slug]` | Individual club public page | Everyone |
| `/(frontend)/events/[slug]` | Individual event public page | Everyone |
| `/(auth)/*` | Login, register, set-password | Everyone |

### Deprecated Routes (Auto-redirect in middleware)

- `/admin-dashboard/*` → redirects to `/user/*`
- `/editor/*` → redirects to `/user/*`
- `/contributor/*` → redirects to `/user/*`
- `/admin` → redirects to appropriate dashboard based on role

## Collections (18 total)

### Tenant-Scoped (have `institutionField` + tenant isolation hooks)

| Collection | Slug | Module |
|---|---|---|
| Posts | `posts` | `src/collections/Posts/` |
| Pages | `pages` | `src/collections/Pages/` |
| Categories | `categories` | `src/collections/Categories.ts` |
| Media | `media` | `src/collections/Media.ts` |
| Comments | `comments` | `src/collections/Comments/` |
| Votes | `votes` | `src/collections/Votes/` |
| PageViews | `page-views` | `src/collections/PageViews/` |
| AdminLogs | `admin-logs` | `src/collections/AdminLogs/` |
| Feedback | `feedback` | `src/collections/Feedback.ts` |
| Templates | `templates` | `src/collections/Templates.ts` |
| Newsletters | `newsletters` | `src/collections/Newsletters/` |
| NewsletterSubscribers | `newsletter-subscribers` | `src/collections/NewsletterSubscribers/` |
| NewsletterEvents | `newsletter-events` | `src/collections/NewsletterEvents/` |
| Clubs | `clubs` | `src/modules/clubs/collections/Clubs.ts` |
| Events | `events` | `src/modules/events/collections/Events.ts` |

### Platform-Level (no institution scoping)

| Collection | Slug | Purpose |
|---|---|---|
| Users | `users` | All platform users (scoped by `institution` relationship) |
| Institutions | `institutions` | Tenant definitions (domains, branding, settings) |

## Access Control Files

| File | Purpose |
|---|---|
| `src/access/permissions.ts` | PERMISSION_MAP, role definitions, scope helpers |
| `src/access/hasPermission.ts` | Core `checkPermission()`, `hasPermission()`, `publicOrInstitution()` |
| `src/access/hasClubAccess.ts` | Club-scoped permission shortcuts |
| `src/access/hasBlogAccess.ts` | Blog-scoped permission shortcuts |
| `src/access/isSuperAdmin.ts` | SuperAdmin-only access guards |
| `src/access/selfOrAdmin.ts` | Self-or-admin access for user profiles |

---

## Coding Standards

### 1. Component Architecture

**Always use base components** from `src/components/base/` for consistency:

```tsx
// ✅ Good — uses base components
import { SearchInput } from '@/components/base/SearchInput'
import { DataTable } from '@/components/base/DataTable'
import { LoadingButton } from '@/components/base/LoadingButton'
import { PageHeader } from '@/components/base/PageHeader'
import { EmptyState } from '@/components/base/EmptyState'
import { FilterBar } from '@/components/base/FilterBar'
import { DataTableSkeleton } from '@/components/base/DataTableSkeleton'

// ❌ Bad — building one-off search/table/pagination per page
```

### 2. Every Data Page MUST Have

- [ ] **Search** — debounced (300ms), URL param synced (`?q=`)
- [ ] **Pagination** — server-side, URL param synced (`?page=`)
- [ ] **Filtering** — URL param synced (`?status=`, `?role=`)
- [ ] **Loading states** — skeleton placeholder while data loads
- [ ] **Empty states** — friendly message + action CTA when no results
- [ ] **Error boundary** — graceful error handling with retry

### 3. State Management

```tsx
// ✅ Use URL search params for server-synced state (search, filters, pagination)
const searchParams = useSearchParams()
const page = Number(searchParams.get('page') || '1')
const query = searchParams.get('q') || ''

// ✅ Use useState only for UI-local state (modals, dropdowns, form inputs)
const [showDialog, setShowDialog] = useState(false)

// ❌ Never use useState for search/filter/pagination — breaks back button, sharing
```

### 4. Loading & Feedback Patterns

```tsx
// ✅ Every clickable action must show loading state
<LoadingButton loading={isPending} onClick={handleAction}>
  Save Changes
</LoadingButton>

// ✅ Server actions must use useTransition for loading feedback
const [isPending, startTransition] = useTransition()
const handleAction = () => {
  startTransition(async () => {
    const result = await serverAction()
    // handle result...
  })
}

// ✅ Use toast notifications for action results
toast({ title: 'Success', description: 'Changes saved.' })

// ❌ Never leave a button with no feedback on click
```

### 5. TypeScript

```tsx
// ✅ Strong typing — use Payload generated types
import type { User, Post, Comment, Club, Event, Institution } from '@/payload-types'

// ✅ Explicit return types on server actions
export async function changeUserRole(userId: string, newRole: string): Promise<ActionResult> { }

// ✅ Define shared types
interface ActionResult {
  success: boolean
  message: string
}

// ❌ Never use `any` — enforced by eslint (error level). Use `unknown` and narrow.
// Exception: tenant query wrappers use controlled `as any` with eslint-disable for Payload generic compatibility
```

### 6. Server Components vs Client Components

```tsx
// ✅ Server Components (default) — for data fetching & static UI
// - Pages, layouts, data displays
// - Can directly call Payload API
// - Use tenantContext.ts for tenant-scoped queries

// ✅ Client Components ('use client') — ONLY when needed for:
// - Interactivity (onClick, onChange, forms)
// - Browser APIs (usePathname, useSearchParams)
// - State (useState, useReducer)

// Pattern: Server parent fetches data → passes to client child
// Page.tsx (server) → DataTableClient.tsx (client)
```

### 7. Multi-Tenant Query Pattern

```tsx
// ✅ In server components — use tenantContext + tenantQuery
import { getCurrentTenant } from '@/utilities/tenantContext'
import { tenantFind, tenantCreate } from '@/utilities/tenantQuery'

const tenant = await getCurrentTenant()
const posts = await tenantFind(payload, 'posts', tenant.institutionId, {
  where: { _status: { equals: 'published' } },
  limit: 10,
})

// ✅ Or use Payload directly — collection hooks auto-inject tenant filter
// (defense-in-depth: even if you forget tenantQuery, hooks catch it)
const posts = await payload.find({
  collection: 'posts',
  where: { _status: { equals: 'published' } },
})

// ❌ Never hardcode institution IDs
// ❌ Never use overrideAccess: true without understanding it bypasses tenant hooks
```

### 8. Pagination Pattern

```tsx
// ✅ Server-side pagination via Payload
const results = await payload.find({
  collection: 'posts',
  page: currentPage,
  limit: 10,
  where: { /* filters */ },
  sort: '-createdAt',
})

// Pass to client: results.docs, results.totalPages, results.page
```

### 9. Club Theming

```tsx
// ✅ Clubs have per-club themes via ClubThemeWrapper
import { ClubThemeWrapper } from '@/components/ClubThemeWrapper'

// ClubTheme interface:
// { primaryColor, accentColor, cardStyle, fontPreset }
// Available CSS vars: --club-primary, --club-accent
// Card styles: club-card-default | glass | bordered | elevated
// Font presets: club-font-default | modern | classic | technical

<ClubThemeWrapper theme={club.theme}>
  {/* Club content uses --club-primary, --club-accent */}
</ClubThemeWrapper>
```

### 10. File Organization

```
src/
├── access/                # RBAC access control functions
│   ├── permissions.ts     # PERMISSION_MAP, roles, scope helpers
│   ├── hasPermission.ts   # Core permission checker
│   ├── hasClubAccess.ts   # Club-scoped access
│   ├── hasBlogAccess.ts   # Blog-scoped access
│   └── isSuperAdmin.ts    # Platform-level access
├── app/
│   ├── (auth)/            # Login, register, set-password
│   ├── (frontend)/        # Public pages (blog, clubs, events)
│   ├── (payload)/         # Payload admin (disabled for end users)
│   ├── platform/          # SuperAdmin dashboard (Conosco team only)
│   ├── user/              # Unified role-holder dashboard
│   └── api/               # API routes (resolve-tenant, auth, etc.)
├── collections/           # Payload collection configs
├── modules/
│   ├── clubs/             # Club-specific collection + logic
│   └── events/            # Event-specific collection + logic
├── components/
│   ├── base/              # Reusable base components (DataTable, SearchInput, etc.)
│   ├── ui/                # shadcn/ui primitives
│   └── ...                # Domain-specific components
├── fields/
│   ├── institution.ts     # institutionField (auto-sets tenant on create)
│   └── slug/              # Slug field with auto-generation
├── hooks/
│   └── tenantIsolation.ts # Defense-in-depth tenant hooks
├── utilities/
│   ├── tenantResolver.ts  # Hostname → institution resolution
│   ├── tenantContext.ts   # Server component tenant helpers
│   └── tenantQuery.ts     # Tenant-scoped Payload wrappers
└── providers/
    ├── Tenant/            # Client-side tenant context provider
    ├── Auth/              # Auth state provider
    └── Theme/             # Theme provider (light/dark)
```

### 11. Import Order

```tsx
// 1. React/Next.js
import { useState } from 'react'
import Link from 'next/link'

// 2. External libraries
import { Loader2 } from 'lucide-react'

// 3. UI components (shadcn)
import { Button } from '@/components/ui/button'

// 4. Base components
import { SearchInput } from '@/components/base/SearchInput'

// 5. Access control / permissions
import { hasPermission } from '@/access/hasPermission'

// 6. Types
import type { User, Post, Club } from '@/payload-types'

// 7. Utilities
import { cn } from '@/utilities/ui'
import { getCurrentTenant } from '@/utilities/tenantContext'
```

---

## Base Component API Reference

### SearchInput

```tsx
<SearchInput
  placeholder="Search users..."
  defaultValue={query}           // from searchParams
  paramName="q"                  // URL param name
/>
```

### DataTable

```tsx
<DataTable
  columns={columns}             // Column definitions
  data={users}                  // Current page data
  totalPages={totalPages}
  currentPage={page}
  isLoading={false}
/>
```

### LoadingButton

```tsx
<LoadingButton
  loading={isPending}
  variant="default"
  onClick={handleSave}
>
  Save
</LoadingButton>
```

### FilterBar

```tsx
<FilterBar filters={[
  { paramName: 'role', label: 'Role', options: [
    { label: 'All', value: '' },
    { label: 'Editor', value: 'editor' },
    { label: 'Contributor', value: 'contributor' },
  ]},
  { paramName: 'status', label: 'Status', options: [...] },
]} />
```

### PageHeader

```tsx
<PageHeader
  title="User Management"
  description="Manage all platform users"
  action={<Button>Add User</Button>}   // optional
/>
```

### EmptyState

```tsx
<EmptyState
  icon={Users}
  title="No users found"
  description="Try adjusting your search or filters"
  action={<Button>Clear Filters</Button>}  // optional
/>
```

### DataTableSkeleton

```tsx
<DataTableSkeleton columns={5} rows={10} />
```

---

## Performance Guidelines

- **Never fetch all records** — always paginate (`limit: 10-25`)
- **Use `payload.count()`** instead of `payload.find({ limit: 0 })` for counts
- **Parallelize independent queries** with `Promise.all()`
- **Use `depth: 0`** when you don't need populated relations
- **Prefer server components** — avoid unnecessary client bundles
- **Debounce search** — 300ms minimum to avoid excessive queries
- **Tenant resolution is cached** — 5min TTL in both middleware and resolver

## Security Guidelines

- **Always verify auth** in server actions — never trust client
- **Fetch full user** via `payload.findByID()` to check roles — don't rely on JWT claims alone
- **Use `checkPermission()` from `hasPermission.ts`** for all permission checks
- **Validate inputs** — check types, ranges, allowed values
- **Use Payload access control** as primary guard, UI checks as secondary
- **Tenant isolation is automatic** via collection hooks — but prefer `tenantQuery.ts` wrappers for explicit scoping
- **`overrideAccess: true`** bypasses tenant isolation hooks — use only for trusted system operations (seeds, migrations)
- **SuperAdmin has no institution** — they're platform-level and bypass all tenant checks
- **Never expose institution_admin operations** without verifying the user IS an institution_admin for THAT institution

## Accessibility Guidelines

- All interactive elements must be keyboard accessible
- Use `aria-label` on icon-only buttons
- Loading states must announce to screen readers (`aria-busy`, `aria-live`)
- Provide skip links, proper heading hierarchy
- Color must not be the only indicator (use icons + text)
