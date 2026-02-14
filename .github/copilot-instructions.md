# Copilot Instructions — GCET Blog Platform

## Project Overview

- **Framework**: Next.js 15 (App Router, RSC)
- **CMS**: Payload CMS v3 (embedded)
- **UI**: shadcn/ui + Tailwind CSS + Radix primitives
- **Language**: TypeScript (strict)
- **Auth**: Payload built-in auth with custom role system
- **Database**: MongoDB (via Payload)

## Architecture Principles

### Role Hierarchy

```
contributor < editor < editor+isAdmin < editor+isAdmin+canManageAdmins
```

- `contributor`: Can create posts, manage own content
- `editor`: Full content management (review, publish, moderate)
- `editor+isAdmin`: User management, activity logs, system oversight
- `editor+isAdmin+canManageAdmins`: Can grant/revoke admin privileges, protected from deletion

### Route Structure

| Route Group | Purpose | Access |
|---|---|---|
| `/(frontend)/editor/*` | Editor workspace (content management) | `role === 'editor'` |
| `/admin-dashboard/*` | Admin overview (users, logs, stats) | `isAdmin === true` |
| `/contributor/*` | Contributor workspace | `role === 'contributor'` |
| `/(frontend)/*` | Public pages | Everyone |

### Shared Layout

- **EditorSidebar** is the single navigation component for both editor and admin routes
- Admin-only links (`User Management`, `Admin Dashboard`) render conditionally via `isAdmin` check
- Never duplicate navigation — one source of truth

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
import type { User, Post, Comment } from '@/payload-types'

// ✅ Explicit return types on server actions
export async function changeUserRole(userId: string, newRole: 'contributor' | 'editor'): Promise<ActionResult> { }

// ✅ Define shared types
interface ActionResult {
  success: boolean
  message: string
}

// ❌ Never use `any` — use `unknown` and narrow
```

### 6. Server Components vs Client Components

```tsx
// ✅ Server Components (default) — for data fetching & static UI
// - Pages, layouts, data displays
// - Can directly call Payload API

// ✅ Client Components ('use client') — ONLY when needed for:
// - Interactivity (onClick, onChange, forms)
// - Browser APIs (usePathname, useSearchParams)
// - State (useState, useReducer)

// Pattern: Server parent fetches data → passes to client child
// Page.tsx (server) → DataTableClient.tsx (client)
```

### 7. Pagination Pattern

```tsx
// ✅ Server-side pagination via Payload
const results = await payload.find({
  collection: 'users',
  page: currentPage,
  limit: 10,
  where: { /* filters */ },
  sort: '-createdAt',
})

// Pass to client: results.docs, results.totalPages, results.page
```

### 8. Search Pattern

```tsx
// ✅ Debounced search that syncs to URL
// SearchInput component handles debounce internally
// Page reads from searchParams, queries Payload with `like` operator

const where = query
  ? { or: [
      { name: { like: query } },
      { email: { like: query } },
    ]}
  : {}
```

### 9. File Organization

```
src/components/
├── base/              # Reusable base components (SearchInput, DataTable, etc.)
├── ui/                # shadcn/ui primitives (Button, Card, Input, etc.)
├── Card/              # Domain-specific components
├── Header/
└── ...
```

### 10. Import Order

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

// 5. Types
import type { User } from '@/payload-types'

// 6. Utilities
import { cn } from '@/utilities/ui'
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

## Security Guidelines

- **Always verify auth** in server actions — never trust client
- **Fetch full user** via `payload.findByID()` to check `isAdmin` — don't rely on JWT claims alone
- **Validate inputs** — check types, ranges, allowed values
- **Use Payload access control** as primary guard, UI checks as secondary
- **Never expose canManageAdmins operations** without checking the flag on both client AND server

## Accessibility Guidelines

- All interactive elements must be keyboard accessible
- Use `aria-label` on icon-only buttons
- Loading states must announce to screen readers (`aria-busy`, `aria-live`)
- Provide skip links, proper heading hierarchy
- Color must not be the only indicator (use icons + text)
